import Vue from 'vue'

export default {

  get(query) {
    const maxResults = 5;
    const temporary = ['AIzaSyCweS', 'ErOIUdmJKX', '_-rGezCB8Aj', '-YrNFMB4'];
    const key = temporary.join('');
    const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&maxResults=${maxResults}&key=${key}`;
    return Vue.http.get(`${url}&q=${query}`);
  }
}
