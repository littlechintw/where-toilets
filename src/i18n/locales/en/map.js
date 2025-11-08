export default {
  title: 'Toilets in Area',
  locate: 'Locate',
  locating: 'Locating...',
  customLocation: {
    title: 'Custom Location',
    placeholder: 'Enter address, landmark or coordinates (e.g.: Taipei 101, 25.0340,121.5645)',
    searchTip: 'You can enter address, landmark name or latitude/longitude coordinates',
    searching: 'Searching...',
    errorOutOfRange: 'Coordinates out of Taiwan range',
    errorNotFound: 'Address not found, please try a more specific description',
    errorService: 'Address search failed'
  },
  usageTips: {
    title: 'Usage Instructions',
    tip1: 'Drag the blue pin on the map to your desired search location',
    tip2: 'Moving or zooming the map will automatically update toilets in the area',
    tip3: 'Click "Locate" to use your GPS position',
    tip4: 'Overlapping toilets will be clustered into blue circles, click to view list',
    tip5: 'You can also search by entering an address above',
    tip6: 'Use filters to further narrow your search'
  },
  filters: {
    title: 'Filter Criteria',
    grade: {
      label: 'Grade',
      all: 'All',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement',
      fail: 'Failed'
    },
    type: {
      label: 'Type',
      all: 'All',
      male: 'Male',
      female: 'Female',
      mixed: 'Mixed',
      accessible: 'Accessible',
      family: 'Family'
    },
    diaper: 'Show only with changing table',
    reset: 'Reset Filters'
  },
  toiletList: {
    title: 'Toilets in Map Area',
    count: '',
    viewAll: 'View All',
    noData: 'No toilets found in map area',
    needLocation: 'Please allow location access or drag the map to display toilets',
    cluster: {
      title: 'Toilets in This Area',
      count: ''
    }
  },
  toiletInfo: {
    grade: 'Grade',
    type: 'Type',
    category: 'Category',
    diaper: 'Changing Table',
    distance: 'Distance',
    manager: 'Management Unit',
    address: 'Address',
    hasDialper: 'Available',
    noDialper: 'Not Available',
    navigation: 'Open Navigation'
  },
  errors: {
    locationFailed: 'Location failed',
    dataLoadFailed: 'Failed to load data',
    mapUpdateFailed: 'Failed to update toilets in map area'
  }
}