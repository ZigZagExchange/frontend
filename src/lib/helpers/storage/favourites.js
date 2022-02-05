import storage from './index';

//get favourites from local storage.
export function fetchFavourites(){
    return JSON.parse(storage.getItem('favourites') || '{}');
}

//add item to favourites and return complete list, or empty list on failure.
export function add(item){

    try {
        var favs_json = storage.getItem('favourites');
        var favourites = JSON.parse(favs_json);
    
        favourites.push(item);
    
        storage.setItem('favourites', JSON.stringify(favourites));

        return favourites;
    } catch {
        return {}
    }
    
}

