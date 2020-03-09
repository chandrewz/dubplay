import Vue from 'vue'

export default {

  get(query) {
    const maxResults = 5;
    const temporary = ['AIzaSyDhb', 'XQCx2LbHD', '02Bpfqc3M', 'aE845gTgq2N4'];
    const key = temporary.join('');
    const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&maxResults=${maxResults}&key=${key}`;
    return Vue.http.get(`${url}&q=${query}`);
  }
}
