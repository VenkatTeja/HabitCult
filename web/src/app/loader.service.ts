import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    constructor() { }
    isLoading: boolean = false;

    loaderStart() {
        this.isLoading = true;
    }

    loaderEnd() {
        this.isLoading = false;
    }


}
