<template>
  <!-- search & queue -->
  <div class="search" :class="{ visible : isSearchOpen }">
    <div class="search-bar flex-row flex-center">
      <i class="fa fa-search"></i>
      <input class="search-input flex-one" type="text" placeholder="Search video..." v-model="searchText" v-on:keyup.enter="query">
      <button class="btn-common" @click="close">
        <i class="fa fa-times-circle"></i>
      </button>
    </div>
    <ul class="results">
      <li class="video flex-row flex-center" v-for="(video, index) in results.items" :key="index">
        <div>
          <img :src="video.snippet.thumbnails.default.url" @click="queue(video)" class="thumbnail">
          <i class="fa fa-play-circle-o play"></i>
        </div>
        <div class="title" v-html="video.snippet.title">{{ video.snippet.title }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import QueryService from '../services/QueryService.js'

export default {
  name: 'Search',
  data() {
    return {
      searchText: '',
      results: {}
    }
  },
  props: ['isSearchOpen'],
  methods: {
    query() {
      let component = this;
      QueryService.get(this.searchText).then(response => {
        component.results = response.data;
      });
    },
    queue(video) {
      this.$emit('queue', video);
    },
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';
.search {

  background-color: $monokai-dark;
  position: absolute;
  transition: border-color .4s cubic-bezier(.215,.61,.355,1),background-color .4s cubic-bezier(.215,.61,.355,1),opacity .4s cubic-bezier(.215,.61,.355,1),transform .4s cubic-bezier(.215,.61,.355,1);
  width: 420px;
  display: none;
  right: 0;

  .search-bar {
    margin: 0 1em 0 1em;

    .search-input {
      background-color: transparent;
      border: 0;
      border-bottom: 2px dotted $monokai-yellow;
      color: $monokai-white;
      font-size: 1em;
      outline: none;
      margin: 0 .5em;
    }

    .search-input::placeholder {
      color: $monokai-grey;
    }
  }
}

.search.visible {
  display: block;
  -webkit-animation: slide-down .3s ease-out;
  -moz-animation: slide-down .3s ease-out;
}

@-webkit-keyframes slide-down {
      0% { opacity: 0; -webkit-transform: translateY(-100%); }   
    100% { opacity: 1; -webkit-transform: translateY(0); }
}
@-moz-keyframes slide-down {
      0% { opacity: 0; -moz-transform: translateY(-100%); }   
    100% { opacity: 1; -moz-transform: translateY(0); }
}

.results {
  .play {
    color: $monokai-green;
    display: none;
    position: absolute;
    transform: translate(-120%, 20%);
  }

  .thumbnail:hover + .play {
    display: inline;
  }
}
</style>
