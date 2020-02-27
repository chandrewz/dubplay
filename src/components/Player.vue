<template>
  <div class="player-wrapper flex-column">
    
    <!-- header -->
    <div class="player-header flex-row flex-center">
      <h2 class="flex-one">
        <i class="fa fa-headphones" title="A player inspired by Dubtrack.fm"></i> <span>DubPlayer</span>
      </h2>
      <div class="user-count"><i class="fa fa-user" title="Users online"></i> {{ users }}</div>
      <button class="btn-common" @click="isSearchOpen = !isSearchOpen">
        <i class="fa fa-bars" title="Search menu"></i>
      </button>
    </div>

    <!-- player -->
    <div class="player flex-row">
      <div class="flex-one">
        <youtube :video-id="videoId" :player-vars="playerVars" ref="youtube" @ended="ended" :width="500" :height="250"></youtube>
      </div>
      <div class="playlist flex-one">
        <table>
          <tr v-for="(video, index) in queue" v-bind:key="index" class="flex-center">
            <td class="number" v-bind:class="{ playing : index == 0 }">
              {{ index == 0 ? 'Playing' : index }}
            </td>
            <td @click="skip(index)">
              <img v-bind:src="video.thumbnail" class="thumbnail">
              <i class="fa fa-window-close-o skip"></i>
            </td>
            <td v-html="video.title">{{ video.title }}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- search & queue -->
    <div class="search" v-bind:class="{ visible : isSearchOpen }">
      <div class="search-bar flex-row flex-center">
        <i class="fa fa-search"></i>
        <input class="search-input flex-one" type="text" placeholder="Search video..." v-model="searchText" v-on:keyup.enter="query">
        <button class="btn-common" @click="isSearchOpen = false">
          <i class="fa fa-times-circle"></i>
        </button>
      </div>
      <ul class="results">
        <li class="video flex-row flex-center" v-for="(video, index) in results.items" :key="index">
          <div>
            <img v-bind:src="video.snippet.thumbnails.default.url" @click="queueVideo(video)" class="thumbnail">
            <i class="fa fa-play-circle-o play"></i>
          </div>
          <div class="title" v-html="video.snippet.title">{{ video.snippet.title }}</div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import QueryService from '../services/QueryService.js'
import ScaleDroneService from '../services/ScaleDroneService.js'

export default {
  name: 'Player',
  data() {
    return {
      queue: [],
      videoUrl: '',
      videoId: '',
      playerVars: {
        autoplay: 1
      },
      isSearchOpen: false,
      searchText: '',
      results: {},
      users: 0
    }
  },
  methods: {
    playVideo() {
      this.videoId = this.queue[0].id;
      // added delay becase playing right after fails
      setTimeout(() => {
        this.player.playVideo();
        if (this.queue[0].timestamp) {
          this.player.seekTo(this.queue[0].timestamp);
        }
      }, 2000);
    },
    queueVideo(video, isLocal = true) {
      let item = isLocal ? {
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.default.url
      } : video;
      this.queue.push(item);
      if (isLocal) {
        // queued from app, so publish; don't queue when broadcast is received
        ScaleDroneService.publish(item);
      }
      if (this.queue.length === 1) {
        this.playVideo();
      }
    },
    ended() {
      this.queue.shift();
      if (this.queue.length > 0) {
        this.playVideo();
      }
    },
    query() {
      let component = this;
      QueryService.get(this.searchText).then(response => {
        component.results = response.data;
      });
    },
    broadcastPlaylist() {
      if (this.queue.length > 0) {
        this.player.getCurrentTime().then(result => {
          let copy = [...this.queue];
          copy[0].timestamp = result;
          ScaleDroneService.publish({ action: 'sync', queue: copy });
        });
      }
    },
    skip(index) {
      this.queue.splice(index, 1);
      if (this.queue.length === 0) {
        this.player.stopVideo();
      }
      if (index === 0 && this.queue.length > 0) {
        this.playVideo();
        ScaleDroneService.publish({ action: 'sync', queue: this.queue, play: true });
      } else {
        ScaleDroneService.publish({ action: 'sync', queue: this.queue});
      }
    }
  },
  computed: {
    player() {
      return this.$refs.youtube.player
    }
  },
  mounted() {
    let hash = 'abc123'; // use for rooms later
    ScaleDroneService.connect(hash);
    ScaleDroneService.room.on('message', message => {
      console.log(message);

      // make sure message was not sent by us
      if (ScaleDroneService.getClientId() !== message.clientId) {

        if (message.data.action === 'sync') {

          const isNew = this.queue.length === 0 && this.queue.length !== message.data.length;

          // check if data received is different
          if (this.queue.length !== message.data.length) {
            this.queue = message.data.queue;

            if (message.data.queue.length === 0) {
              this.player.stopVideo();
            } else if (message.data.play || isNew) {
              this.playVideo();
            }
          }
        } else {
          this.queueVideo(message.data, false);
        }
      }
    });
    ScaleDroneService.room.on('member_join', () => {
      this.broadcastPlaylist();
      this.users++;
    });
    ScaleDroneService.room.on('member_leave', () => this.users--);
    ScaleDroneService.room.on('members', members => this.users = members.length);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../styles/_colors.scss';

.player-wrapper {
  background: $monokai-darker;
}

.player-header {
  flex-wrap: no-wrap;
}

.playlist {
  .number {
    color: $monokai-grey;
    font-family: monospace;
    font-size: 15px;
    font-weight: bold;
  }

  .playing {
    color: $monokai-blue;
    font-weight: normal;
  }

  .skip {
    color: $monokai-red;
    display: none;
    position: absolute;
    transform: translate(-120%, 20%);
  }

  .thumbnail:hover + .skip {
    display: inline;
  }
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

.search {
  background-color: $monokai-dark;
  margin-top: 3em;
  position: absolute;
  right: -420px;
  top: 0;
  transition: border-color .4s cubic-bezier(.215,.61,.355,1),background-color .4s cubic-bezier(.215,.61,.355,1),opacity .4s cubic-bezier(.215,.61,.355,1),transform .4s cubic-bezier(.215,.61,.355,1);
  width: 420px;
}

.search.visible {
  transform: translateX(-420px);
}

.search .search-bar {
  margin: 0 1em 0 1em;
}

.search .search-bar .search-input {
  background-color: transparent;
  border: 0;
  border-bottom: 2px dotted $monokai-yellow;
  color: $monokai-white;
  font-size: 1em;
  outline: none;
  margin: 0 .5em;
}

.search .search-bar .search-input::placeholder {
  color: $monokai-grey;
}

.thumbnail {
  cursor: pointer;
}

.user-count {
  font-family: monospace;
  color: $monokai-orange;
  margin-right: 1em;
}
</style>
