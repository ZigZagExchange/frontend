import { removeItemAll } from '../utils';
import storage from './index';

//get favourites from local storage.
export function fetchFavourites(){
    return JSON.parse(storage.getItem('favourites') || '[]');
}

//add item to favourites and return complete list, or empty list on failure.
export function addFavourite(item){

    try {
        var favs_json = storage.getItem('favourites') || '[]';
        var favourites = JSON.parse(favs_json);

        console.log(favourites);

        if(!favourites.includes(item)){
            favourites.push(item);

            storage.setItem('favourites', JSON.stringify(favourites));    
        }
        console.log(favourites);
        return favourites;
    } catch (e){
        console.log(e);
        return []
    }
    
}


//remove item from favourites and return complete list, or empty list on failure.
export function removeFavourite(item){

    try {
        var favs_json = storage.getItem('favourites') || '[]';
        var favourites = JSON.parse(favs_json);

        console.log(favourites);

        favourites = favourites.filter(e => e !== item);
        console.log("remoevd: ", favourites);
        storage.setItem('favourites', JSON.stringify(favourites));    
        
       
        console.log(favourites);

        return favourites;
    } catch (e){
        console.log(e);
        return []
    }
    
}

