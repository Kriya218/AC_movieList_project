const BASE_URL = 'https://webdev.alphacamp.io/';
const INDEX_URL = BASE_URL + 'api/movies/';
const POSTER_URL = BASE_URL + 'posters/';
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");


function renderMovieList(data) {
  let rawHTML = '';
  //image, title
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
              <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
            </div>
          </div>
        </div>
      </div>`
    // console.log(item);
  })
  dataPanel.innerHTML = rawHTML;
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

function removeFromFavorite(id) {
  //若 movies 清單不存在 或 沒有電影則結束函式
  if(!movies || !movies.length) return
  //透過 id 找到要刪除的電影，若如果沒有符合的對象，將返回 -1 
  const removeMovieIndex = movies.findIndex( data => data.id === id)
  if (removeMovieIndex === -1) return
  // 移除不要的電影
  movies.splice(removeMovieIndex,1);
  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies));
  // 更新頁面
  return renderMovieList(movies);
}


// 綁定事件
dataPanel.addEventListener('click', function onPanelClicked(event) {  
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id));
    // console.log(event.target.dataset)
  }else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id));

  }
})
renderMovieList(movies);