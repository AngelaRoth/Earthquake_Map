function getStringMonth(m) {
  var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  return months[m];
}

function getStringDate(d) {
  var dates = ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  return dates[d];
}

function getTwoDigitMinutes(minute) {
  switch (minute) {
    case 0:
      return '00';
      break;
    case 1:
      return '01';
      break;
    case 2:
      return '02';
      break;
    case 3:
      return '03';
      break;
    case 4:
      return '04';
      break;
    case 5:
      return '05';
      break;
    case 6:
      return '06';
      break;
    case 7:
      return '07';
      break;
    case 8:
      return '08';
      break;
    case 9:
      return '09';
      break;
    default:
      return minute;
  }
}

function makeTimePretty(time) {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var t = new Date(time);

  var day = t.getUTCDay();
  var month = t.getUTCMonth();
  var date = t.getUTCDate();
  var year = t.getUTCFullYear();
  var hours = t.getUTCHours();
  var minutes = t.getUTCMinutes();

  var twoDigitMinutes = getTwoDigitMinutes(minutes);
/*
  var prettyTime = dayNames[day] + ' ' + monthNames[month] + ' ' + date + ', ' + year + ', at ' + hours + ':' + twoDigitMinutes;
*/
var prettyTime = hours + ':' + twoDigitMinutes + ' UTC on ' + dayNames[day] + ', ' + monthNames[month] + ' ' + date + ' ' + year;
  return prettyTime;
}

function getIconColor(sig) {
  if (sig >= 1800) {
    return ('ff0000');
  } else if (sig >= 1500) {
    return ('ff4500');
  } else if (sig >= 1200) {
    return ('ffa500');
  } else if (sig >= 900) {
    return ('ffCC00');
  } else if (sig >= 600) {
    return ('ffff24');
  } else {
    return ('7bb718');
  }
}


// This is an attempt at getting search terms which might appear
// in the newspaper. The earthquake site place names are too random to
// get a really good search term.
// 1. If word "of" appears, extract string after it
// 2. If comma appears, extract string after it
// 3. If word "the" appears, extract string after it
// 4. Words from part of string still not ignored are combined with "+"
function getSearchTerm(place) {
  var msgStart;
  var sliceStart;
  var ofLoc = place.indexOf(' of ');
  console.log('index of of = ' + ofLoc);
  if (ofLoc !== -1) {
    sliceStart = ofLoc + 4;
    place = place.slice(sliceStart);
    console.log('sliced place = ' + place);
  }
  var commaLoc = place.indexOf(', ');
  if (commaLoc !== -1) {
    sliceStart = commaLoc + 2;
    place = place.slice(sliceStart);
    console.log('sliced place = ' + place);
  }
  var theLoc = place.indexOf(' the ');
  if (theLoc !== -1) {
    sliceStart = ofLoc + 5;
    place = place.slice(sliceStart);
    console.log('sliced place = ' + place);
  }

  var term = place.replace('region', '').replace('northern', '').replace('southern', '').replace('eastern', '').replace('western', '').replace(' the', '').replace(',', '').replace('   ', '+').replace('  ', '+').replace(' ', '+');
  if (term[0] === '+') {
    term = term.slice(1);
  }
  console.log('term = ' + term);
  return term;
}

