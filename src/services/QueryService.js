import Vue from 'vue'

export default {

  get(query) {
    const maxResults = 7;
    const temporary = ['AIzaSyBO9', 'PhvaVI9Zl7t', 'ZOBiUEw39', 'C7_T-8BpZI'];
    const key = temporary.join('');
    const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&maxResults=${maxResults}&key=${key}`;
    return Vue.http.get(`${url}&q=${query}`);
  }
}
