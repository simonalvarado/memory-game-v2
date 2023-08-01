<template>
    <div @click="selectCard" class="col-3 col-md-2 col-lg-2 col-xl-2 mb-4 d-flex justify-content-center">
        <div class="card--container">
            <div v-if="flipped" class="card__face card__face--front">
                <img :src="image" alt="Memory Card" class="card__face--image">
            </div>
            <div v-else class="card__face card__face--back">
               <div class="card__face--back-text">?</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        flipped: {
            type: Boolean,
            required: false
        }
    },
    setup(props, context) {
    const selectCard = () => {
      context.emit('select-card', props.id); // Pass the id of the clicked card
    };

    return {
      selectCard
    };
  }
}
</script>

<style scoped>
.card--container{
    width: 100%;
    height: 0;
    padding-top: 100%;
    position: relative;
    cursor: pointer;
}
.card__face{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    transition: 0.5s transform ease-in;
    border-radius: 5px;
}
.card__face:hover{
    transform: scale(1.05);
}
.card__face--back{
    background-color: rgb(10, 34, 55);
    color: white;
    transition: background-color 0.3s ease, transform 0.3s ease;
}
.card__face--back:hover{
    background-color: rgb(23, 71, 110);
}
.card__face--front{
    transition: transform 0.3s ease;
    transform: rotateY(360deg);
    backface-visibility: visible;
}
.card__face--back-text{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    font-size: 2rem;
}
.card__face--image{
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
}
</style>
