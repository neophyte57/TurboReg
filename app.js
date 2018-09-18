// TODO: Consider https://github.com/vuejs/vue-devtools
// 
// Application Features:  
// - Remembers previous criteria
// - Goes to trusted CoE site to complete registration and pay
//
// Future:
// - Warning if number registered exceeds capacity
// 
// Trying to use doc comments as per https://github.com/Microsoft/tsdoc 
// 
// Acknowledgements:
// - https://www.sitepoint.com/fetching-data-third-party-api-vue-axios/
// - 
// - https://vuejsdevelopers.com/2017/05/20/vue-js-safely-jquery-plugin/
//

// Vue component wrapping JQuery's datepicker.
// See https://vuejsdevelopers.com/2017/05/20/vue-js-safely-jquery-plugin/
//
Vue.component('date-picker', {
  template: '<input v-bind:placeholder="placeholderValue" v-bind:value="initialValue" />',
  props: [ 'dateFormat', 'placeholderValue', 'initialValue' ],
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
        this.selectedFacilities = this.loadPreviousSelection('selectedFacilities', this.selectedFacilities);
        this.selectedStartDate = this.loadPreviousSelection('selectedStartDate', this.selectedStartDate);
        this.includeFutureActivities = this.loadPreviousSelection('includeFutureActivities', this.includeFutureActivities);
        this.selectedAgeRanges = this.loadPreviousSelection('selectedAgeRanges', this.selectedAgeRanges);
        this.selectedActivityTypes = this.loadPreviousSelection('selectedActivityTypes', this.selectedActivityTypes);
      }).catch(function (error) {

        // e.g. Sometimes deserialization may not work because of problems during serialization to localStorage
        console.log(error);
      })
  }, 
  methods: {
    // @param activityDetails - see sample-data.json for object attributes 
    // @returns true or false 
    includeResult(activityDetails) {

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
    },
    loadPreviousSelection(key, defaultValue) {

      if (localStorage.getItem(key)) {
        return JSON.parse(localStorage.getItem(key));
      } else {
        // Empty string seems to work better than undefined 
        return defaultValue;
      }
    },
    saveSelection(key, value) {

      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  watch: {
    selectedFacilities: {
      handler() { 
        this.saveSelection('selectedFacilities', this.selectedFacilities);
      }
    },
    selectedStartDate: {
      handler() { 
        this.saveSelection('selectedStartDate', this.selectedStartDate);
      }
    },  
    includeFutureActivities: {
      handler() { 
        this.saveSelection('includeFutureActivities', this.includeFutureActivities);
      }
    },
    selectedAgeRanges: {
      handler() { 
        this.saveSelection('selectedAgeRanges', this.selectedAgeRanges);
      }
    },
    selectedActivityTypes: {
      handler() { 
        this.saveSelection('selectedActivityTypes', this.selectedActivityTypes);
      }
    }
  }
});