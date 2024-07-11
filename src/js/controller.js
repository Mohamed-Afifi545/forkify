import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //loading recipes
    await model.loadRecipe(id);

    // rendering recipes
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1 get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2 load search results
    await model.loadSearchResult(query);

    //3 render results
    resultsView.render(model.getSearchResultsPage());

    //4 render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goTOPage) {
  //1 render new results
  resultsView.render(model.getSearchResultsPage(goTOPage));

  //2 render new pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings(in state)
  model.updateServings(newServings);

  //update the recipeView
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show spinner
    addRecipeView.renderSpinner();
    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close window and reset the form
    const form = document.querySelector('.upload');

    setTimeout(function () {
      addRecipeView.toggleWindow();
      form.innerHTML = `
        <div class="upload__column">
        <h3 class="upload__heading">Recipe data</h3>
        <label>Title</label>
        <input required name="title" type="text" />
        <label>URL</label>
        <input required name="sourceUrl" type="text" />
        <label>Image URL</label>
        <input required name="image" type="text" />
        <label>Publisher</label>
        <input required name="publisher" type="text" />
        <label>Prep time</label>
        <input required name="cookingTime" type="number" />
        <label>Servings</label>
        <input required name="servings" type="number" />
        </div>
        
        <div class="upload__column">
        <h3 class="upload__heading">Ingredients</h3>
        <label>Ingredient 1</label>
        <input
        required
        name="ingredient-1"
        placeholder="Format: 'Quantity,Unit,Description'"
        />
        <label>Ingredient 2</label>
        <input
        type="text"
             name="ingredient-2"
             placeholder="Format: 'Quantity,Unit,Description'"
             />
             <label>Ingredient 3</label>
             <input
             type="text"
             name="ingredient-3"
             placeholder="Format: 'Quantity,Unit,Description'"
             />
             <label>Ingredient 4</label>
             <input
             type="text"
             name="ingredient-4"
             placeholder="Format: 'Quantity,Unit,Description'"
             />
             <label>Ingredient 5</label>
             <input
             type="text"
             name="ingredient-5"
             placeholder="Format: 'Quantity,Unit,Description'"
             />
             <label>Ingredient 6</label>
             <input
             type="text"
             name="ingredient-6"
             placeholder="Format: 'Quantity,Unit,Description'"
             />
             </div>
             
             <button class="btn upload__btn">
             <svg>
             <use href="src/img/icons.svg#icon-upload-cloud"></use>
             </svg>
             <span>Upload</span>
             </button>
             `;
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('😒', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
