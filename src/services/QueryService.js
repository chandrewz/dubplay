import Vue from 'vue'

export default {

  get(query) {
    const maxResults = 5;
    const key = 'AIzaSyBQGdt4DU0NcwoBJvB5N6plDAXw85t2QfM';
    const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&maxResults=${maxResults}&key=${key}`;
    return Vue.http.get(`${url}&q=${query}`);
  }
}
