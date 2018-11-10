import { observable, action } from 'mobx';

class Store {
    constructor() {
        this.data = observable({
            theater:[
            { id: "cgv", title: "CGV" },
            { id: "megabox", title: "MEGA BOX" },
            { id: "lotteCinema", title: "LOTTE CINEMA" }
          ],
          location: {},
          nearCinemas:[],
          selectedCinemaInfo:[],
          address: ""
      });
    }

    @action
    initLocation=(data)=>{
        this.data.location={...data};
    }

    @action
    initAddress=(address)=>{
        this.data.address=address;
    }

    @action
    getNearCinemas=(cinema)=>{
        this.data.nearCinemas=[...cinema];
    }

    @action
    getCinemasTime=(timeInfo)=>{
        this.data.selectedCinemaInfo=[...timeInfo];
    }
}

export default function initStore() {
  return new Store();
}