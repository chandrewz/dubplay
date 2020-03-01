<template>
  <div class="history">
    <span v-if="history.length" class="monospace">// Recently Played</span>
    <ul>
      <li v-for="(item, index) in history.slice().reverse()" :key="index">
        <a
          :href="'https://www.youtube.com/watch?v=' + item.id"
          target="_blank"
          v-html="item.title.length > 45 ? item.title.substring(0, 45) + '...' : item.title"
          class="monospace truncate">
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'History',
    props: ['history']
  }
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

a {
  text-decoration: none;
}

a:hover {
  border-bottom: 1px dotted $monokai-blue;
}

ul {
  list-style-type: none;
  text-align: left;
}

.history {
  margin-top: 2em;
}
</style>
