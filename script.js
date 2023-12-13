const STORED_BOOKS = "stored_books";
const LOAD_STORED_BOOKS = "load_stored_books";
const BOOK_DATA = "book_data";
const CUSTOM_EVENT = "render-books";
let booksCollection = [];

const incompleteBookshelf = document.getElementById("incompleteBookshelfList");
const completeBookshelf = document.getElementById("completeBookshelfList");

document.addEventListener(STORED_BOOKS, () => {
  console.log("Data berhasil disimpan.");
});

document.addEventListener(LOAD_STORED_BOOKS, () => {
  refreshBooksFromStorage();
});

function generateUniqueId() {
  return +new Date();
}

function createBook(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function createBookElement(book) {
  const { id, title, author, year, isCompleted } = book;

  const titleElement = document.createElement("h3");
  titleElement.innerText = title;

  const authorElement = document.createElement("p");
  authorElement.innerText = "Penulis: " + author;

  const yearElement = document.createElement("p");
  yearElement.innerText = "Tahun: " + year;

  const greenButton = document.createElement("button");
  greenButton.classList.add("green");

  const redButton = document.createElement("button");
  redButton.classList.add("red");
  redButton.innerText = "Hapus buku";
  redButton.addEventListener("click", function () {
    removeBook(id);
  });

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("action");
  actionDiv.append(greenButton, redButton);

  const articleElement = document.createElement("article");
  articleElement.classList.add("book_item");
  articleElement.append(titleElement, authorElement, yearElement, actionDiv);

  if (isCompleted) {
    greenButton.innerText = "Belum selesai dibaca";
    greenButton.addEventListener("click", function () {
      markAsUnfinished(id);
    });
    completeBookshelf.append(articleElement);
  } else {
    greenButton.innerText = "Selesai dibaca";
    greenButton.addEventListener("click", function () {
      markAsFinished(id);
    });
    incompleteBookshelf.append(articleElement);
  }

  return articleElement;
}

function findBookIndex(id) {
  for (const index in booksCollection) {
    if (booksCollection[index].id === id) {
      return index;
    }
  }
  return -1;
}

function findBook(id) {
  for (const book of booksCollection) {
    if (book.id === id) {
      return book;
    }
  }
  return null;
}

function markAsUnfinished(id) {
  const targetBook = findBook(id);
  if (targetBook == null) return;
  targetBook.isCompleted = false;
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  updateBooksToStorage();
}

function removeBook(id) {
  const bookIndex = findBookIndex(id);
  if (bookIndex === -1) return;
  booksCollection.splice(bookIndex, 1);
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  updateBooksToStorage();
}

function markAsFinished(id) {
  const targetBook = findBook(id);
  if (targetBook == null) {
    return;
  }
  targetBook.isCompleted = true;
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  updateBooksToStorage();
}

function searchBooks() {
  const searchInput = document.getElementById("searchBookTitle");
  const filter = searchInput.value.toUpperCase();
  const bookItems = document.querySelectorAll(
    "section.book_shelf > .book_list > .book_item"
  );

  for (let i = 0; i < bookItems.length; i++) {
    let textValue;
    textValue = bookItems[i].textContent || bookItems[i].innerText;
    if (textValue.toUpperCase().indexOf(filter) > -1) {
      bookItems[i].style.display = "";
    } else {
      bookItems[i].style.display = "none";
    }
  }
}

const checkStorageAvailability = () => {
  if (typeof Storage === "undefined") {
    alert("Your Browser does not support web storage");
    return false;
  }

  return true;
};

function saveBooksData() {
  const dataToSave = JSON.stringify(booksCollection);
  localStorage.setItem(BOOK_DATA, dataToSave);

  document.dispatchEvent(new Event(STORED_BOOKS));
}

function loadBooksFromStorage() {
  const serializedData = localStorage.getItem(BOOK_DATA);

  let data = JSON.parse(serializedData);

  if (data !== null) booksCollection = data;
  document.dispatchEvent(new Event(LOAD_STORED_BOOKS));
}

const updateBooksToStorage = () => {
  if (checkStorageAvailability()) saveBooksData();
};

function refreshBooksFromStorage() {
  for (let book of booksCollection) {
    const newBookElement = createBookElement(book);
    if (book.isCompleted === true) {
      completeBookshelf.append(newBookElement);
    } else {
      incompleteBookshelf.append(newBookElement);
    }
  }
}

document.addEventListener(CUSTOM_EVENT, function () {
  incompleteBookshelf.innerHTML = "";
  completeBookshelf.innerHTML = "";

  for (const book of booksCollection) {
    const bookElement = createBookElement(book);
    if (book.isCompleted === false) {
      incompleteBookshelf.append(bookElement);
    } else {
      completeBookshelf.append(bookElement);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addNewBook();
    submitForm.reset();
  });

  const searchInput = document.getElementById("searchBook");
  searchInput.addEventListener("keyup", function (e) {
    e.preventDefault();
    searchBooks();
  });

  searchInput.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBooks();
  });

  if (checkStorageAvailability()) {
    loadBooksFromStorage();
  }
});

const statusSpan = document.querySelector("span");
const checkBox = document.getElementById("inputBookIsComplete");
checkBox.addEventListener("change", function (e) {
  if (e.target.checked) {
    statusSpan.innerText = "Selesai dibaca";
  } else {
    statusSpan.innerText = "Sudah Selesai dibaca";
  }
});

function addNewBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isChecked = document.getElementById("inputBookIsComplete").checked;

  const generatedId = generateUniqueId();
  const book = createBook(generatedId, title, author, year, isChecked);

  booksCollection.push(book);

  document.dispatchEvent(new Event(CUSTOM_EVENT));
  updateBooksToStorage();
}
