// TODO: Consider https://github.com/vuejs/vue-devtools
// 
// Application Features:  
// - Remembers previous criteria
// - Goes to trusted CoE site to complete registration and pay
//
// Future:
// - Warning if number registered exceeds capacity
// 
// Acknowledgements:
// - https://www.sitepoint.com/fetching-data-third-party-api-vue-axios/
// - 
// - https://vuejsdevelopers.com/2017/05/20/vue-js-safely-jquery-plugin/
//

Vue.component('date-picker', {
  template: '<input v-bind:placeholder="placeholderValue" />',
  props: [ 'dateFormat', 'placeholderValue' ],
  mounted: function() {

    var self = this;
    $(this.$el).datepicker({

      dateFormat: this.dateFormat,
      onSelect: function(date) {
        // See https://vuejs.org/v2/guide/components.html
        self.$emit('update-date', date);
      }   
    });
  },
  beforeDestroy: function() {
    $(this.$el).datepicker('hide').datepicker('destroy');
  }
});


const vm = new Vue({
  el: '#app',
  data: {
    results: [],
    // Some static data for testing purposes
    message: "Bonjour le monde",
    facilities: [],
    selectedFacilities: [],
    selectedStartDate: "",
    includeFutureActivities: false,
    ageRanges: [],
    selectedAgeRanges: [],
    activityTypes: [],
    selectedActivityTypes: [],
    initiatedSearch: false
  },
  mounted() {

    // Initialization for Foundation UI behaviors
    $(document).foundation();

    console.log("Querying for data at " + new Date() + " ...");
    axios.get("https://data.edmonton.ca/resource/bcq5-mvix.json?$$app_token=mGU6RS7ckRjIiKwH0k120LJkb")
      .then(response => {
        
        this.results = response.data;
        console.log("Received data at " + new Date());

        // Get unique lists
        var uniqueFacilities = new Set();
        var uniqueAgeRanges = new Set();        
        var uniqueActivityTypes = new Set();        
        for (var i = 0; i < this.results.length; i++) {

          uniqueFacilities.add(this.results[i].facility);
          uniqueAgeRanges.add(this.results[i].age);
          uniqueActivityTypes.add(this.results[i].activity_type);
        }
        this.facilities = Array.from(uniqueFacilities);
        this.facilities.sort();
        this.ageRanges = Array.from(uniqueAgeRanges);
        this.ageRanges.sort();
        this.activityTypes = Array.from(uniqueActivityTypes);
        this.activityTypes.sort();

        console.log("Finished processing data at " + new Date());        

        // Load previous selections 
        if (localStorage.getItem('selectedFacilities')) this.selectedFacilities = JSON.parse(localStorage.getItem('selectedFacilities'));
      })
  }, 
  methods: {
    includeResult(activityDetails) {
      // activityDetails - see sample-data.json for object attributes 
      // Returns true or false 

      var doInclude = true;
      if (doInclude) {

        // If there were any selectedFacilities, does this activityDetails have a matching facility?
        doInclude = ((this.selectedFacilities.length > 0) ? (this.selectedFacilities.indexOf(activityDetails.facility) != -1) : doInclude);
      } 
      if (doInclude) {

        // If there were any selectedAgeRanges, does this activityDetails have a matching age range?
        doInclude = ((this.selectedAgeRanges.length > 0) ? (this.selectedAgeRanges.indexOf(activityDetails.age) != -1) : doInclude);
      } 
      return doInclude;
    },
    updateStartDate(date) {
      this.selectedStartDate = date;
    }
  },
  watch: {
    selectedFacilities: {
      handler() { 
        console.log('selectedFacilities changed!'); 
        localStorage.setItem('selectedFacilities', JSON.stringify(this.selectedFacilities));
      },
      deep: true
    },
    includeFutureActivities: {
      handler() { 
        console.log('includeFutureActivities changed!'); 
      }
    }
  }
});