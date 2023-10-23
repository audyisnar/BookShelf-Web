const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'RAK_BUKU';

function generateID() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function checkIsComplete() {
    const isComplete = document.getElementById('inputIsComplete').checked;
    if(isComplete){
        return true;
    } else {
        return false;
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveDataBook() {
    if (isStorageExist()) {
        const dataBooks = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, dataBooks);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function addBook() {
    const idBook = generateID();
    const titleBook = document.getElementById('inputTitle').value;
    const authorBook = document.getElementById('inputAuthor').value;
    const yearBook = document.getElementById('inputYear').value;
    const isComplete = checkIsComplete();

    const bookObject = generateBookObject(idBook, titleBook, authorBook, yearBook, isComplete);
    books.push(bookObject);

    document.getElementById('inputTitle').value = "";
    document.getElementById('inputAuthor').value = "";
    document.getElementById('inputYear').value = "";
    document.getElementById('inputIsComplete').checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveDataBook();
}

function searchBook(){
    const uncompletedBookList = document.getElementById('uncompleteBookshelfList');
    const completedBookList = document.getElementById('completeBookshelfList');

    const titleBook = document.getElementById('searchTitle').value;

    if (titleBook !== "") {
        const arrayTitleSearch = titleBook.toLowerCase().split(" ");
        for (const [key, itemBook] of books.entries()) {
            const arrayTitleBook = itemBook.title.toLowerCase().split(" ");
            let index = 0;

            if(key == 0){
                uncompletedBookList.innerHTML = '';
                completedBookList.innerHTML = '';
                console.log(itemBook)
            }

            while(index < arrayTitleSearch.length){
                if(arrayTitleSearch[index] == arrayTitleBook[index]){
                    if(index == arrayTitleSearch.length-1){
                        console.log(itemBook.title)
                        const bookElement = makeListBook(itemBook);
                        if (!itemBook.isCompleted) {
                            uncompletedBookList.append(bookElement);
                        } else {
                            completedBookList.append(bookElement)
                        }
                    }
                    index++;
                } else {
                    break;
                }
            }
        }
    } else {
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.getElementById('searchTitle').value = "";
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBook();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.getElementById('searchTitle').value = "";
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBook();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.getElementById('searchTitle').value = "";
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBook();
}

function makeListBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('firstActionButton', 'fa', 'fa-undo');

        undoButton.addEventListener('click', function() {
            undoBookFromCompleted(bookObject.id);
        });

        container.append(undoButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('firstActionButton', 'fa', 'fa-check');
        
        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });
        
        container.append(checkButton);
    }

    const trashButton = document.createElement('button');
    trashButton.classList.add('fa', 'fa-trash-o');

    trashButton.addEventListener('click', function () {
        const modal = document.getElementById('confirmationModal');
        modal.style.display = "block";

        const cancelButton = document.getElementById("cancelDelete");
        const deleteButton = document.getElementById("delete");

        cancelButton.addEventListener('click', function () {
            modal.style.display = "none";
        });
        document.getElementById("titleBook").innerText = bookObject.title;

        deleteButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
            modal.style.display = "none";
        });
    });

    container.append(trashButton);

    return container;
}

function loadDataFromStorage() {
    const dataBooks = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(dataBooks);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('saved-book', function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('render-book', function () {
    console.log(books);
    const uncompletedBookList = document.getElementById('uncompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeListBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement)
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('confirmationModal').style.display = 'none';

    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addBook();
    });

    const search = document.getElementById('searchSubmit');
    search.addEventListener('click', function(e){
        e.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

