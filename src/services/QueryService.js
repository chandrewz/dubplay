import Vue from 'vue'

export default {

  get(query) {
    var url = 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&maxResults=3&key=AIzaSyBQGdt4DU0NcwoBJvB5N6plDAXw85t2QfM';
    return Vue.http.get(`${url}&q=${query}`);
  }
}
