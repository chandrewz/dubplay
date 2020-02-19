<template>
  <div id="app">
    <div class="player-wrap">
      <Player />
    </div>
  </div>
</template>

<script>
import Player from './components/Player.vue'

export default {
  name: 'app',
  components: {
    Player
  }
}
</script>

<style lang="scss">
@import 'styles/_colors.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $monokai-white;
  // margin: 3em;
  display: -ms-flexbox;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  min-height: 100vh;
  width: 100%;
}

.player-wrap {
  width: 1080px;
  height: calc(100vh - 4em);
}

body {
  background-color: $monokai-darkest;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-one {
  flex: 1;
}

.flex-center {
  align-items: center;
}

.btn-common {
  color: $monokai-white;
  background-color: transparent;
  border: 0;
  font-size: 180%;
  outline: none;
}
</style>
