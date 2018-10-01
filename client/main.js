window.Event = new Vue();

Vue.component('anno', {
  template: `
  <div class="anno">
    <div class="note">
      <input
        class="fenput"
        v-model="realFEN"
        v-on:keyup.enter="submit"/>
    </div>
    <div class="fenGrid">
      <div
        v-for="(section, depth) in uglyAnnoSections"
        class="fenSection"
        @mouseout="resetGridFocus">
        <div
          v-for="(letter, index) in section"
          class="fenLetter"
          @mouseover="highlightCell(letter, section, index, depth)">{{letter}}</div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      fakeFEN: 'RKBZQBKR/PPPPPP1P/6P1/8/3p4/8/ppp1pppp/rkbzqbkr',
      realFEN: 'placeholder',
      count: 8,
      fakeArrs: ['item', 'item'],
      uglyAnnoSections: [],
      arrFen: [],
    }
  },
  methods: {
    resetGridFocus: function() {
      Event.$emit('resetGridFocus')
    },
    highlightCell: function(l, s, i, d) {
      var index = d * this.count + i;
      this.$root.highMatch = index;
      Event.$emit('highlightMatches');
      // console.log(index);
    },
    annoSections: function() {
      var uglyRoots = this.$root.uglyArrs;
      var prettyRoots = this.$root.prettyArrs;
      var uglyArrs = [], prettyArrs = [];
      for (var i = 0; i < uglyRoots.length; i++) {
        var tempUgly = [];
        for (var ee = 0; ee < uglyRoots[i].length; ee++) {
          tempUgly.push(uglyRoots[i][ee])
        }
        uglyArrs.push(tempUgly)
      }
      for (var n = 0; n < prettyRoots.length; n++) {
        var tempPretty = [];
        for (var uu = 0; uu < prettyRoots[n].length; uu++) {
          tempPretty.push(prettyRoots[n][uu])
        }
        prettyArrs.push(tempPretty)
      }
      this.uglyMap = uglyArrs;
      this.prettyMap = prettyArrs;;
      return [uglyArrs, prettyArrs];
    },
    testArrs: function() {
      console.log(this.$root.uglyArrs);
      console.log(this.annoSections());
      // this.annoSections();
    },
    submit: function(e) {
      Event.$emit('changeFEN');
    },
    getText: function() {
      return this.realFEN;
    },
    updateAnno: function() {
      this.arrFen = this.$root.uglified();
      var ugArr = this.annoSections();
      this.uglyAnnoSections = ugArr[0];
    }
  },
  mounted() {
    var grid = this.$root.$children[0];
    var prevFEN = localStorage.getItem('masterFEN');
    // console.log(localStorage);
    console.log('previous was ' + prevFEN);
    // this.realFEN = localStorage.getItem('masterFEN')
    this.realFEN = grid.prettyFEN('none', grid.FEN)
    // this.realFEN = grid.prettyFEN('local', prevFEN);
    this.arrFen = this.$root.uglified();
    var ugArr = this.annoSections();
    this.uglyAnnoSections = ugArr[0];
    // console.log(this.uglyAnnoSections);
    Event.$on('resetAnno', this.updateAnno);
    console.log('anno online');
    // this.testArrs();
  }
})

Vue.component('character', {
  props: ['profile'],
  template: `
    <span
      :class="setIcon(profile)">
    </span>
  `,
  data() {
    return {
      stats: [],
      names: ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'],
    }
  },
  methods: {
    setIcon: function(char) {
      return char.color + ' ' + this.icon(char)
    },
    icon: function(char) {
      return 'char fa fa-4x fa-chess-' + char.name;
    }
  },
})

Vue.component('chessboard', {
  template : `
  <div class="grid">
    <div
      v-for="cell in grid"
      :class="tileType(cell)"
      @mousedown="setFocus(cell.index)"
      @mouseover="ifDrag(cell.index, $event)">
        <span v-if="showIndex">{{cell.index}}</span>
        <character v-if="cell.hasChar" :profile="cell.Char"></character>
    </div>
  </div>
  `,
  data() {
    return {
      msg: 'Placeholder',
      showIndex: false,
      grid: [],
      rows: 8,
      cols: 8,
      tileA: '#ff0000',
      tileB: 'transparent',
      uglyFen: 'none',
      names: ['zing', 'queen', 'bishop', 'knight', 'rook', 'pawn'],
    }
  },
  computed: {
    total: function() {
      return this.rows * this.cols;
    },

    // localFEN
    FEN: function() {
      var res = '';
      var lastIsNum = /.*(\d)$/gm;
      for (var i = 0; i < this.total; i++) {
        if (this.grid[i].hasChar) {
          var first = this.grid[i].Char.name.charAt(0);
          if (this.grid[i].Char.team < 1) {
            if (this.grid[i].Char.name == 'king')
              first = 'z'
            res += first.toUpperCase();
          } else {
            if (this.grid[i].Char.name == 'king')
              first = 'z'
            res += first;
          }
        } else {
          res += 1;
        }
      }
      return res;
    },
    isAlt: function() {
      return (this.isEven(this.total)) ? false : true;
    },
  },
  methods: {
    prettyFEN: function(where, str) {
      var self = this, ugly = '', pretty = '', prettyResult = '';
      var rows = [];
      if (where == 'local')
        rows = this.$root.chunkString(str, self.rows);
        // rows = this.$root.chunkString(this.$root.masterFEN, this.$root.masterRows);
      else
        rows = this.$root.chunkString(self.FEN, self.rows);
      for (var i = 0; i < rows.length; i++) {
        var targ = rows[i];
        var matches = targ.match(self.$root.rx.unique);
        var prettified = '';
        matches.pop();
        for (var e = 0; e < matches.length; e++) {
          var match = matches[e];
          if (self.$root.rx.isWord.test(match)) {
            prettified += match;
          } else {
            prettified += match.length
          }
        }
        if (i < rows.length - 1) {
          prettyResult += prettified + '/';
        } else {
          prettyResult += prettified;
        }
        pretty += rows[i] + '/'
        ugly += rows[i];
      }
      this.uglyFen = ugly;
      // console.log(this.uglyFen);
      return prettyResult;
    },
    tileType: function(cell) {
      var style = '';
      style += cell.isActive ? ' grid-cell-active' : ' grid-cell-idle'
      var minmax = this.getMinMaxRangeOfRows(cell);
      var range = 'none';
      for (var i = 0; i < minmax.length; i++) {
        if ((cell.index >= minmax[i][0]) && (cell.index <= minmax[i][1])) {
          range = i;
          break;
        } else {
          continue;
        }
      }
      if (this.isEven(range)) {
        if (this.isEven(cell.index))
          style += 'A'
        else
          style += 'B'
      } else {
        if (this.isOdd(cell.index))
          style += 'A'
        else
          style += 'B'
      }
      return style;
    },
    getMinMaxRangeOfRows(cell) {
      var source = this.rows;
      var ranges = [];
      for (var i = 0; i < this.rows; i++) {
        var min = i * source;
        var max = min + source - 1;
        ranges.push([min, max])
      }
      return ranges;
    },
    ifDrag: function(i, evt) {
      this.$root.parseModifiers(evt);
      if ((this.$root.isDragging) && (!this.grid[i].isActive)) {
        console.log(this.$root.Shift);
        if (this.$root.Shift)
          this.grid[i].isActive = true;
        else
          this.grid[i].isRoute = true;
      } else if (this.$root.isDragging) {
        this.grid[i].isActive = false;
      }
    },
    setFocus: function(i) {
      this.clearFocus();
      this.grid[i].isActive = true;
      console.log(i + ' was clicked');
    },
    isEven: function(n) {
       return n % 2 == 0;
    },
    isOdd: function(n) {
       return Math.abs(n % 2) == 1;
    },
    clearGrid: function() {
      for (var i = 0; i < this.grid.length; i++)
        this.grid.pop()
    },
    clearFocus: function() {
      for (var i = 0; i < this.grid.length; i++)
        this.grid[i].isActive = false
    },
    updateGrid: function() {
      this.$root.setCSS('grid-rows', this.rows);
      this.$root.setCSS('grid-cols', this.cols);
      for (var i = 0; i < this.total; i++) {
        var newCell = {
          isActive: false,
          isRoute: false,
          hasChar: false,
          showIndex: true,
          Char: {
            color: 'none',
            name: 'none',
          },
          index: i,
        };
        this.grid.push(newCell);
      }
    },
    charFromFirst: function(str) {
      var types = this.names;
      var tempRX = new RegExp(str, 'i');
      for (var i = 0; i < this.names.length; i++) {
        var firstChar = this.names[i].charAt(0);
        if (tempRX.test(firstChar)) {
        // if (str == firstChar) {
          str = this.names[i]
          break;
        }
      }
      return str;
    },
    setChars: function() {
      var str = this.$root.masterFEN;
      var self = this;
      for (var i = 0; i < str.length; i++) {
        var curr = str[i];
        var type = self.charFromFirst(curr);
        // console.log(type);
        if (self.$root.rx.isWord.test(curr)) {
          self.grid[i].hasChar = true;
          var first = curr.charAt(0);
          if (self.$root.rx.lowercase.test(first)) {
            self.grid[i].Char.color = 'red';
          } else {
            self.grid[i].Char.color = 'white';
          }
          if (type !== 'zing') {
            self.grid[i].Char.name = type;
          } else {
            self.grid[i].Char.name = 'king'
          }
        } else {
          self.grid[i].hasChar = false;
          self.grid[i].Char.name = '1'
          self.grid[i].Char.team = false;
        }
      }
    },
    assignChars: function() {
      var teams = {
        white : {
          pawn: [8,9,10,11,12,13,22,15],
          rook: [0, 7],
          knight: [1, 6],
          bishop: [2, 5],
          king: [3],
          queen: [4],
        },
        red : {
          pawn: [48,49,50,35,52,53,54,55],
          rook: [56, 63],
          knight: [57, 62],
          bishop: [58, 61],
          king: [59],
          queen: [60],
        },
      };
      var which = -1;
      for (let [color, team] of Object.entries(teams)) {
        which++;
        for (let [type, index] of Object.entries(teams[color])) {
          for (let i = 0; i < index.length; i++) {
            var targ = index[i];
            this.grid[targ].hasChar = true;
            this.grid[targ].Char.name = type;
            this.grid[targ].Char.color = color;
            this.grid[targ].Char.team = which;
          }
        }
      }
    },
    grabFEN: function() {
      var fenputText = this.$root.$children[1].realFEN;
      var result = this.$root.uglified();
      return result;
    },
    highlightGrid: function() {
      this.clearFocus();
      var match = this.$root.highMatch;
      this.grid[match].isActive = true;
      // this.updateGrid();
    }
  },
  mounted: function() {
    var self = this;
    this.updateGrid();
    this.assignChars();
    Event.$on('set', self.setChars)
    Event.$on('highlightMatches', self.highlightGrid)
    Event.$on('resetGridFocus', self.clearFocus)
    // this.setChars();
    // console.log(this.FEN);
    // console.log(this.prettyFEN);
  }
})


var app = new Vue({
  el: '#app',
  data: {
    masterFEN: '',
    masterRows: 8,
    prettyArrs: [],
    uglyArrs: [],
    highMatch: 0,
    rx: {
      unique: /[a-zA-Z]|(\d*)/gm,
      empty: /^$/gm,
      isWord: /[^\d]/,
      lowercase: /[a-z]/,
      single: /./,
    },
    isDragging: false,
    Ctrl: false,
    Alt: false,
    Shift: false,
  },
  beforeDestroyed() {
    var self = this;
    var storage = window.localStorage;
    console.log(storage); // Empty
    storage.setItem('masterFEN', self.masterFEN)
    console.log(storage); // Shows test: 'is persistent'
  },
  mounted: function () {
    var self = this;
    // self.masterFEN =
    Event.$on('changeFEN', self.updateFEN)
    window.addEventListener('mousedown', function(evt) {
      self.parseModifiers(evt);
      self.isDragging = true;
    });
    window.addEventListener('mouseup', function(evt) {
      self.parseModifiers(evt);
      self.isDragging = false;
    });
    console.log('app online');
    Event.$emit('changeFEN');
    // console.log(this.getCSS('cell-WH'));
  },
  methods: {
    updateFEN: function() {
      this.masterFEN = this.uglified();
      var storage = window.localStorage;
      var targ = this.uglified();
      console.log(storage);
      console.log(targ);
      storage.setItem('masterFEN', targ)
      Event.$emit('set');
      Event.$emit('resetAnno');
      console.log('Updated');
      console.log(this.prettyArrs);
      console.log(this.uglyArrs);
    },
    uglified: function() {
      var str = this.$children[1].realFEN;
      var matches = str.split('/');
      var res = '', arrs = [], reugly = '';
      var self = this;
      matches.forEach(function(v,i,a) {
        var sections = v.match(self.rx.unique);
        sections.pop();
        sections.forEach(function(x,y,z) {
          if (self.rx.isWord.test(x)) {
            res += x;
          } else {
            var count = Number(x);
            for (var nn = 0; nn < count; nn++) {
              res += '1'
            }
          }
        });
        var temp = res.substr(res.length - 8, res.length);
        reugly += temp + '/';
        arrs.push(v)
      });
      this.prettyArrs = arrs;
      var reuglify = reugly.split('/');
      reuglify.pop()
      this.uglyArrs = reuglify;
      // console.log(this.u);
      return res;
    },
    parseModifiers: function(evt) {
      // console.log(evt);
      if (evt.ctrlKey)
        this.Ctrl = true;
      else
        this.Ctrl = false;
      if (evt.shiftKey)
        this.Shift = true;
      else
        this.Shift = false;
      if (evt.altKey)
        this.Alt = true;
      else
        this.Alt = false;
    },
    // https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript/14349616#14349616
    chunkString(str, len) {
      var _size = Math.ceil(str.length/len),
          _ret  = new Array(_size),
          _offset;
      for (var _i=0; _i<_size; _i++) {
        _offset = _i * len;
        _ret[_i] = str.substring(_offset, _offset + len);
      }
      return _ret;
    },
    getCSS(prop) {
      return window.getComputedStyle(document.documentElement).getPropertyValue('--' + prop);
    },
    setCSS(prop, data){
      document.documentElement.style.setProperty('--' + prop, data);
    }
  }
});
