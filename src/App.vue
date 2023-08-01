<template>
  <div :class="{ 'game d-flex flex-column align-items-center justify-content-between': true, 'game--innactive': isGameWon}">
    <h1 class="game__title pb-3 pt-4">Memory Game</h1>
    <div v-if="!userName" class="name-container">
      <input type="text" v-model="playerName" class="name-container__input form-control mb-2" placeholder="Ingresa tu nombre">
      <button @click="startGame" class="name-container__button btn btn-primary">Inicar Juego</button>
    </div>
    <div v-else-if="loading" class="spinner-border game__spinner" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div v-else class="board">
      <div class="row">
        <MemoryCard v-for="(card, index) in shuffledCards" :key="index" :id="card.id" :image="card.image" :flipped="card.flipped" :found="card.found" @select-card="flipCard"/>
      </div>
    </div>
    <div v-if="userName">
      <p class="board__scoreboard">
        Correctas: {{ correct }} | Incorrectas: {{ wrong }} - <span @click="restartGame" class="board__scoreboard--restart">Reiniciar</span>
      </p>
    </div>
    <div v-if="isGameWon" class="popup d-flex align-items-center justify-content-center">
      <div class="popup-container d-flex flex-column align-items-center justify-content-center">
        <h1 class="popup__title">¡ Felicitaciones {{ userName }} !</h1>
        <p class="popup__scoreboard">
          Correctas: {{ correct }} | Incorrectas: {{ wrong }}
        </p>
        <button @click="restartGame" class="popup__button btn btn-primary mb-2">Jugar de nuevo</button>
        <button @click="restartName" class="popup__button btn btn-primary">Cambiar de nombre</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import MemoryCard from './components/MemoryCard.vue'
import { launchConfetti } from './utilities/confetti.js'

export default {
  name: 'App',
  components: {
    MemoryCard
  },
  data () {
    return {
      playerName: '',
      userName: localStorage.getItem('userName') || '',
      cards: [],
      selectedCards: [],
      correct: 0,
      wrong: 0,
      loading: false,
      isGameWon: false
    }
  },
  created() {
    const storedUserName = localStorage.getItem('userName');

    if (storedUserName) {
      this.userName = storedUserName;
      this.loading = true
      this.getCards()
    }
  },
  computed: {
    shuffledCards() {
      const sortedCards = this.cards.slice(-24)
      return sortedCards.sort(() => Math.random() - 0.5)
    }
  },
  methods: {
    startGame(){
      localStorage.setItem('userName', this.playerName);
      this.userName = this.playerName
      this.loading = true
      this.getCards()
    },
    getCards() {
      const endpoint = 'https://fed-team.modyo.cloud/api/content/spaces/animals/types/game/entries?per_page=20'
      axios.get(endpoint)
        .then((response) =>{
          const apiData = response.data.entries

          const memoryCards = apiData.flatMap((animal) => [
              { id: animal.meta.uuid + '_1', position: animal.meta.uuid + '_1', name: animal.meta.name, image: animal.fields.image.url, flipped: false, found: false },
              { id: animal.meta.uuid + '_2', position: animal.meta.uuid + '_2', name: animal.meta.name, image: animal.fields.image.url, flipped: false, found: false }
            ])
          
          this.cards = memoryCards
          this.loading = false
        })
        .catch((error) => {
          console.error('Error fetching cards:', error)
          this.loading = false
        })
    },
    flipCard(cardId) {
      console.log('card id', cardId)
      const cardToFlip = this.cards.find(card => card.id === cardId)

      if (!cardToFlip || cardToFlip.flipped || this.selectedCards.length >= 2) {
        return;
      }

      cardToFlip.flipped = true
      this.selectedCards.push(cardToFlip)

      if (this.selectedCards.length === 2) {
        this.checkMatch()
      }
    },
    checkMatch() {
      const [firstCard, secondCard] = this.selectedCards

      if (firstCard.name === secondCard.name) {
        firstCard.found = true
        secondCard.found = true
        this.selectedCards = []
        this.correct++
      } else {
        setTimeout(() => {
          firstCard.flipped = false
          secondCard.flipped = false
          this.wrong++
          this.selectedCards = []
        }, 1100)
      }

      this.checkWin()
    },
    restartGame() {
      this.cards = []
      this.correct = 0
      this.wrong = 0
      this.cards.forEach(card => {
        card.flipped = false;
        card.found = false;
      });
      this.selectedCards = []
      this.isGameWon = false
      this.loading = true
      this.getCards()
    },
    restartName() {
      this.playerName = ''
      localStorage.removeItem('userName');
      this.userName = ''
            this.cards = []
      this.correct = 0
      this.wrong = 0
      this.cards.forEach(card => {
        card.flipped = false;
        card.found = false;
      });
      this.selectedCards = []
      this.isGameWon = false
      this.loading = true
    },
    checkWin() {
      const allCardsFound = this.shuffledCards.every(card => card.found)
      console.log('all cards found?', allCardsFound)
      if (allCardsFound) {
        this.isGameWon = true
        launchConfetti()
      }
    }
  },
  watch: {
    isGameWon(newValue) {
      if (newValue) {
        // When the game is won, enable pointer events and set the opacity and scale to 1 for the popup
        setTimeout(() => {
          this.$el.querySelector('.popup').style.pointerEvents = 'auto';
          this.$el.querySelector('.popup').style.opacity = 1;
          this.$el.querySelector('.popup-container').style.transform = 'scale(1)';
        }, 100);
      }
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
}
.game{
  height: 100vh;
}
.game--innactive{
  position: relative;
}
.game--innactive::before{
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Adjust the opacity to control the darkness */
  z-index: 999;
}
.name-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
}
.name-container__input{
  max-width: 250px;
  margin: 0 auto;
}
.board {
  width: 76%;
  max-width: 850px;
}
.board__scoreboard--restart{
  cursor: pointer;
  font-weight: bold;
}
.game__spinner::after {
  border-top-color: rgb(10, 34, 55); /* Set the border top color (for animation) */
}
.popup {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0; /* Initially set the opacity to 0 to make the popup invisible */
  pointer-events: none; /* Disable pointer events to prevent interaction with the popup */
  transition: opacity 0.3s ease;
}
.popup-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  transform: scale(0.8); /* Initially set the scale to 0.8 to make the popup slightly smaller */
  transition: transform 0.3s ease; /* Add a transition for the transform property */

}
@media (min-width: 1200px) {
  .board {
    width: 55%
  }
}
@media (max-width: 768px) {
  .board {
    width: 90%
  }
  .mb-4{
    margin-bottom: 6px !important;
    padding-left: 3px !important;
    padding-right: 3px !important;
  }
}
</style>
