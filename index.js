const BASE_URL = 'https://webdev.alphacamp.io/';
const INDEX_URL = BASE_URL + 'api/movies/';
const POSTER_URL = BASE_URL + 'posters/';
const movies = [];
let filteredMovies =[];
const MOVIES_PER_PAGE  = 12;

let currentPage = 1;

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector('#paginator');
const modeChangeSwitch = document.querySelector('#change-mode');


function renderMovieList(data) {
  let rawHTML = '';
  if (dataPanel.dataset.mode === 'card-mode') {
  data.forEach(item => {
    rawHTML +=`
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src=${POSTER_URL+item.image} class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle='modal' data-bs-target='#movie-modal' data-id=${item.id}>More</button>
              <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
            </div>
          </div>
        </div>
      </div>`
    // console.log(item);
  })
  dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === 'list-mode') {
      rawHTML += `<ul class="list-group list-group-flush">`;
      data.forEach((item) => {
        rawHTML += `
          <li class="list-group-item d-flex ">
            <div class="col-10">${item.title}</div>
            <div class="buttons col-2">
              <button class="btn btn-primary btn-show-movie align-items-center" data-bs-toggle='modal' data-bs-target='#movie-modal' data-id=${item.id}>More</button>
              <button class="btn btn-info btn-add-favorite ms-2" data-id=${item.id}>+</button>
            </div>
          </li>`
  });
     rawHTML += `</ul>`;
     dataPanel.innerHTML = rawHTML;
  }
  
}

function getMoviesByPage(page) {
  const data = filteredMovies.length > 0 ? filteredMovies : movies;
  //page 1->0-11, page 2->12-23, page 3->24-35 ...
  const startIndex = ( page - 1 ) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML =``
  for (let page=1; page<= numberOfPage; page++) {
    rawHTML +=`<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML;
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title');
  const modalImage = document.querySelector('#movie-modal-image');
  const modalDate = document.querySelector('#movie-modal-date');
  const modalDescription = document.querySelector('#movie-modal-description');

  axios.get(INDEX_URL + id)
  .then(response => {
    // console.log(response.data.results)
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = 'Release Date: ' + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie poster" class="img-fluid">`;
  }
  )
}


function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
  //將 movies 每個值丟到 isMovieIdMatch，返回符合條件的第一個值
   
  function isMovieIdMatch(data) {
    return data.id === id; 
  }
  const movie = movies.find(isMovieIdMatch);
  // 或兩者結合
  //const movie = movies.find(data => data.id === id )
  if (list.some(data => data.id === id)) {
    return alert('This movie has already added to my favorite.')
  }
  list.push(movie);
  // 將 favorite 存在 local storage 
  localStorage.setItem('favoriteMovies', JSON.stringify(list));
  console.log(list);
}

function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
  console.log('mode change to :'+ displayMode)
}

// 切換模式按鈕綁監聽器
modeChangeSwitch.addEventListener('click', event => {
  // console.log(event.target)
  if(event.target.matches('#card-mode-button')) {
    console.log('card-mode') //worked
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-button')) {
    console.log('list-mode') //worked
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})


// 綁定事件
dataPanel.addEventListener('click', function onPanelClicked(event) {  
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id));
    // console.log(event.target.dataset)
  }else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id));

  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A' ) return;
  const page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
  // console.log(event.target.dataset.page);
})


searchForm.addEventListener('submit', function onSearchClicked(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  
  // if (!keyword.length) {
  //   alert('Please enter valid keyword')
  // }
  filteredMovies = movies.filter( (movie) => 
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert("Can't not find movie with keyword: " + keyword)
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
  console.log(filteredMovies);

})


axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  } )
  .catch((err) => console.log(err))