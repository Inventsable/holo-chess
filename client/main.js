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
    console.log('previously:\r\n' + prevFEN);
    // this.realFEN = grid.prettyFEN('none', grid.FEN)
    this.realFEN = grid.prettyFEN('none', prevFEN);
    this.arrFen = this.$root.uglified();
    var ugArr = this.annoSections();
    this.uglyAnnoSections = ugArr[0];
    Event.$on('resetAnno', this.updateAnno);
  }
})

Vue.component('character', {
  props: ['profile'],
  template: `
    <div
      class="charWrap">
      <span
        :class="setIcon(profile)">
      </span>
      <div class="statWrap">
        <div :class="statClass('h', profile.health)"></div>
        <div :class="statClass('m', profile.mana)"></div>
      </div>
    </div>
  `,
  // :ondragstart="masterDragStart"
  // draggable="true"
  data() {
    return {
      stats: [],
      showStats: false,
      names: ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'],
    }
  },
  methods: {
    statClass: function(type, num) {
      // var hBar = this.$el.children[1].children[0];
      // hBar.style.width = num * 10 + '%';
      var res = '';
      if (this.showStats) {
        if (/h/.test(type)) {
          res += 'healthBarWrap'
        } else if (/m/.test(type)){
          res += 'manaBarWrap'
        } else {

        }
      } else {
        res += 'invisibleStats'
      }
      return res;
    },
    setIcon: function(char) {
      return char.color + ' ' + this.icon(char)
    },
    icon: function(char) {
      return 'char fa fa-3x fa-chess-' + char.name;
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
      @mouseover="ifDrag(cell.index, $event)"
      @mouseout="hideRoutes">
        <span v-if="showIndex">{{cell.index}}</span>
        <character v-if="cell.hasChar" :profile="cell.Char"></character>
    </div>
  </div>
  `,
  // :ondrop="masterOnDrop"
  // :ondragover="masterDragOver"
  data() {
    return {
      endx: 0,
      msg: 'Placeholder',
      showIndex: true,
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
    getRange: function(index) {
      var minmax = this.getMinMaxRangeOfRows();
      var range = false;
      for (var i = 0; i < minmax.length; i++) {
        if ((index >= minmax[i][0]) && (index <= minmax[i][1])) {
          range = i;
          break;
        } else {
          continue;
        }
      };
      return (range < this.total) ? range : false;
    },
    getRowCol: function(index) {
      var row = this.getRange(index);
      var col = index % this.rows;
      var arrs = this.$root.uglyArrs;
      var verified = arrs[row][col];
      console.log(`Verifying ${index}: ${verified}`);
      return [row, col]
    },
    potentialMoves: function(index, char) {
      var arrs = this.$root.uglyArrs;
      var pos = this.getRowCol(index);
      var row = pos[0], col = pos[1], targ;
      var routes = [], hits = [];
      if (char.name == 'pawn') {
          if (char.color == 'red') {
            var check = index - this.rows;
            if ((row == 6) && (!this.grid[check].hasChar)) {
              targ = index - this.rows - this.rows;
              routes.push(targ);
            }
            targ = index - this.rows;
            routes.push(targ);
          } else {
            var check = index + this.rows;
            if ((row == 1) && (!this.grid[check].hasChar)) {
              targ = index + this.rows + this.rows;
              routes.push(targ)
            }
            targ = index + this.rows;
            routes.push(targ);
          }
      } else if (char.name == 'rook') {
        var streamX1 = [], streamX2 = [], streamY1 = [], streamY2 = [];
        for (var E = 1; E <= col; E++) {
          targ = index - E;
          if (!streamX1.length) {
            routes.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamX1.push(targ)
          }
        }
        for (var W = 1; W < this.rows - col; W++) {
          targ = index + W;
          if (!streamX2.length) {
            routes.push(targ)
          }
          if ((targ < this.total) && (this.grid[targ].hasChar)) {
            streamX2.push(targ)
          }
        }
        for (var N = 1; N < row + 1; N++) {
          targ = index - (this.rows * N);
          if (!streamY1.length) {
            routes.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamY1.push(targ)
          }
        }
        for (var S = 1; S < this.rows - row; S++) {
          targ = index + (this.rows * S);
          if (!streamY2.length) {
            routes.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamY2.push(targ)
          }
        }
      } else if (char.name == 'knight') {
        var y1 = [
          index - this.rows - this.rows - 1,
          index - this.rows - this.rows + 1,
        ];
        var y2 = [
          index + this.rows + this.rows - 1,
          index + this.rows + this.rows + 1,
        ];
        var x1 = [
          index - 2 - this.rows,
          index - 2 + this.rows,
        ];
        var x2 = [
          index + 2 - this.rows,
          index + 2 + this.rows,
        ];
        for (var i = 0; i < y1.length; i++) {
          if (col > 1) {
            if (((i < 1) && (row > 1)) || ((i > 0) && (row < 7))) {
              targ = x1[i];
              routes.push(targ);
            }
          }
          if (col < 6) {
            if (((i < 1) && (row > 1)) || ((i > 0) && (row < 7))) {
              targ = x2[i];
              routes.push(targ);
            }
          }
          if (row > 1) {
            if (((i < 1) && (col > 0)) || ((i > 0) && (col < 7))) {
              targ = y1[i];
              routes.push(targ);
            }
          }
          if (row < 6) {
            if (((i < 1) && (col > 1)) || ((i > 0) && (col < 7))) {
              targ = y2[i];
              routes.push(targ);
            }
          }
        }
      } else if (char.name == 'bishop') {
        var streamNW = [], streamSW = [], streamNE = [], streamSE = [];
        var inBounds = true;
        var tempNW = 0, tempNE = 0, tempSW = 0, tempSE = 0;
        for (var nw = 0; nw < col; nw++) {
          if (nw < 1) {
            tempNW = index - this.rows - 1;
            tempSW = index + this.rows - 1
          } else {
            tempNW = tempNW - this.rows - 1;
            tempSW = tempSW + this.rows - 1;
          }
          if (!streamNW.length) {
            inBounds = this.getRange(tempNW);
            if ((row > 0) && (tempSW < this.total) && (inBounds)) {
              routes.push(tempNW)
            }
          }
          if (!streamSW.length) {
            inBounds = this.getRange(tempSW);
            console.log('SW is ' + inBounds);
            if ((row < 7) && (tempSW < this.total) && (inBounds)) {
              routes.push(tempSW)
            }
          }
          if (tempSW < this.total)
            if (this.grid[tempSW].hasChar)
              streamSW.push(tempSW)
          if (tempNW > 0)
            if (this.grid[tempNW].hasChar)
              streamNW.push(tempNW)
        }
        for (var ne = col + 1; ne < this.rows; ne++) {
          if (ne == col + 1) {
            tempNE = index - this.rows + 1;
            tempSE = index + this.rows + 1
          } else {
            tempNE = tempNE - this.rows + 1;
            tempSE = tempSE + this.rows + 1;
          }
          if (!streamNE.length) {
            inBounds = this.getRange(tempNE);
            if ((row > 0) && (tempNE > 0) && (inBounds)) {
              routes.push(tempNE)
            }
          }
          if (!streamSE.length) {
            inBounds = this.getRange(tempSE);
            console.log('SE is ' + inBounds);
            if ((row < 7) && (tempSE < this.total) && (inBounds)) {
              routes.push(tempSE)
            }
          }
          if (tempSE < this.total)
            if (this.grid[tempSE].hasChar)
              streamSE.push(tempSE)
          if (tempNE > 0)
            if (this.grid[tempNE].hasChar)
              streamNE.push(tempNE)
        }
      } else if (char.name == 'queen') {
        var streamNW = [], streamSW = [], streamNE = [], streamSE = [];
        var inBounds = true;
        var tempNW = 0, tempNE = 0, tempSW = 0, tempSE = 0;
        var streamX1 = [], streamX2 = [], streamY1 = [], streamY2 = [];
        for (var E = 1; E <= col; E++) {
          targ = index - E;
          if (!streamX1.length) {
            routes.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamX1.push(targ)
          }
        }
        for (var W = 1; W < this.rows - col; W++) {
          targ = index + W;
          if (!streamX2.length) {
            routes.push(targ)
          }
          if ((targ < this.total) && (this.grid[targ].hasChar)) {
            streamX2.push(targ)
          }
        }
        for (var N = 1; N < row + 1; N++) {
          targ = index - (this.rows * N);
          if (!streamY1.length) {
            routes.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamY1.push(targ)
          }
        }
        for (var S = 1; S < this.rows - row; S++) {
          targ = index + (this.rows * S);
          if (!streamY2.length) {
            routes.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamY2.push(targ)
          }
        }
        for (var nw = 0; nw < col; nw++) {
          if (nw < 1) {
            tempNW = index - this.rows - 1;
            tempSW = index + this.rows - 1
          } else {
            tempNW = tempNW - this.rows - 1;
            tempSW = tempSW + this.rows - 1;
          }
          if (!streamNW.length) {
            inBounds = this.getRange(tempNW);
            if ((row > 0) && (tempSW < this.total) && (inBounds)) {
              routes.push(tempNW)
            }
          }
          if (!streamSW.length) {
            inBounds = this.getRange(tempSW);
            console.log('SW is ' + inBounds);
            if ((row < 7) && (tempSW < this.total) && (inBounds)) {
              routes.push(tempSW)
            }
          }
          if (tempSW < this.total)
            if (this.grid[tempSW].hasChar)
              streamSW.push(tempSW)
          if (tempNW > 0)
            if (this.grid[tempNW].hasChar)
              streamNW.push(tempNW)
        }
        for (var ne = col + 1; ne < this.rows; ne++) {
          if (ne == col + 1) {
            tempNE = index - this.rows + 1;
            tempSE = index + this.rows + 1
          } else {
            tempNE = tempNE - this.rows + 1;
            tempSE = tempSE + this.rows + 1;
          }
          if (!streamNE.length) {
            inBounds = this.getRange(tempNE);
            if ((row > 0) && (tempNE > 0) && (inBounds)) {
              routes.push(tempNE)
            }
          }
          if (!streamSE.length) {
            inBounds = this.getRange(tempSE);
            console.log('SE is ' + inBounds);
            if ((row < 7) && (tempSE < this.total) && (inBounds)) {
              routes.push(tempSE)
            }
          }
          if (tempSE < this.total)
            if (this.grid[tempSE].hasChar)
              streamSE.push(tempSE)
          if (tempNE > 0)
            if (this.grid[tempNE].hasChar)
              streamNE.push(tempNE)
        }
      } else if (char.name == 'king') {
        var streamNW = [], streamSW = [], streamNE = [], streamSE = [];
        var inBounds = true;
        var tempNW = 0, tempNE = 0, tempSW = 0, tempSE = 0;
        var streamX1 = [], streamX2 = [], streamY1 = [], streamY2 = [];
        for (var E = 1; E <= col; E++) {
          targ = index - E;
          if (!streamX1.length) {
            routes.push(targ)
            streamX1.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamX1.push(targ)
          }
        }
        for (var W = 1; W < this.rows - col; W++) {
          targ = index + W;
          if (!streamX2.length) {
            routes.push(targ)
            streamX2.push(targ)
          }
          if ((targ < this.total) && (this.grid[targ].hasChar)) {
            streamX2.push(targ)
          }
        }
        for (var N = 1; N < row + 1; N++) {
          targ = index - (this.rows * N);
          if (!streamY1.length) {
            routes.push(targ)
            streamY1.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamY1.push(targ)
          }
        }
        for (var S = 1; S < this.rows - row; S++) {
          targ = index + (this.rows * S);
          if (!streamY2.length) {
            routes.push(targ)
            streamY2.push(targ)
          }
          if ((targ >= 0) && (this.grid[targ].hasChar)) {
            streamY2.push(targ)
          }
        }
        for (var nw = 0; nw < col; nw++) {
          if (nw < 1) {
            tempNW = index - this.rows - 1;
            tempSW = index + this.rows - 1
          } else {
            tempNW = tempNW - this.rows - 1;
            tempSW = tempSW + this.rows - 1;
          }
          if (!streamNW.length) {
            inBounds = this.getRange(tempNW);
            if ((row > 0) && (tempSW < this.total) && (inBounds)) {
              routes.push(tempNW)
              streamNW.push(targ)
            }
          }
          if (!streamSW.length) {
            inBounds = this.getRange(tempSW);
            console.log('SW is ' + inBounds);
            if ((row < 7) && (tempSW < this.total) && (inBounds)) {
              routes.push(tempSW)
              streamSW.push(targ)
            }
          }
          if (tempSW < this.total)
            if (this.grid[tempSW].hasChar)
              streamSW.push(tempSW)
          if (tempNW > 0)
            if (this.grid[tempNW].hasChar)
              streamNW.push(tempNW)
        }
        for (var ne = col + 1; ne < this.rows; ne++) {
          if (ne == col + 1) {
            tempNE = index - this.rows + 1;
            tempSE = index + this.rows + 1
          } else {
            tempNE = tempNE - this.rows + 1;
            tempSE = tempSE + this.rows + 1;
          }
          if (!streamNE.length) {
            inBounds = this.getRange(tempNE);
            if ((row > 0) && (tempNE > 0) && (inBounds)) {
              routes.push(tempNE)
              streamNE.push(targ)
            }
          }
          if (!streamSE.length) {
            inBounds = this.getRange(tempSE);
            console.log('SE is ' + inBounds);
            if ((row < 7) && (tempSE < this.total) && (inBounds)) {
              routes.push(tempSE)
              streamSE.push(targ)
            }
          }
          if (tempSE < this.total)
            if (this.grid[tempSE].hasChar)
              streamSE.push(tempSE)
          if (tempNE > 0)
            if (this.grid[tempNE].hasChar)
              streamNE.push(tempNE)
        }
      }
      console.log(`Potential move from ${index} to ${routes}`);
      this.showRoutes(routes);
      // this.showHits(hits)
      // return route;
    },
    showRoutes: function(arrs) {
      for (var i = 0; i < arrs.length; i++) {
        var targ = arrs[i];
        this.grid[targ].isRoute = true;
      }
    },
    hideRoutes: function() {
      for (var i = 0; i < this.grid.length; i++) {
        this.grid[i].isRoute = false;
      }
    },
    findPath: function(origin) {
      // var origin = this.findActive();
      var targ = this.grid[origin];
      this.endx = origin;
      // console.log(origin);
      if (targ.hasChar) {
        var char = this.grid[origin].Char;
        this.potentialMoves(origin, char)
      } else {
        console.log('No character');
      }
    },
    findActive: function() {
      var match = false;
      for (var i = 0; i < this.grid.length; i++) {
        if (this.grid[i].isActive) {
          match = i;
          break;
        }
      }
      return match;
    },
    masterDragOver: function(evt) {
      // this.$root.drop_handler(evt);
    },
    masterOnDrop: function(evt) {
      // this.$root.dragover_handler(evt);
    },
    prettyFEN: function(where, str) {
      var self = this, ugly = '', pretty = '', prettyResult = '';
      var rows = [];
      // if (where == 'local')
        rows = this.$root.chunkString(str, self.rows);
      // else
      //   rows = this.$root.chunkString(self.FEN, self.rows);
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
      if (cell.isRoute && cell.hasChar) {
        var unit = this.endx;
        var player = this.grid[unit].Char;
        if (cell.Char.color !== player.color) {
          style += cell.isRoute ? ' grid-cell-hit' : ' grid-cell-noPath'
        } else {
          style += cell.isRoute ? ' grid-cell-noPath' : ' grid-cell-noPath'
        }
        // if (cell.Char.)
      } else {
        style += cell.isRoute ? ' grid-cell-route' : ' grid-cell-noPath'
      }
      // style += cell.isHit ? ' grid-cell-hit' : ' grid-cell-noHit'
      var minmax = this.getMinMaxRangeOfRows();
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
    getMinMaxRangeOfRows() {
      var source = this.rows;
      var ranges = [];
      for (var i = 0; i < this.rows; i++) {
        var min = i * source;
        var max = min + source - 1;
        ranges.push([min, max])
      }
      return ranges;
    },
    multiSelection: function(i, evt) {
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
    ifDrag: function(i, evt) {
      this.$root.parseModifiers(evt);
      // if ((this.$root.Shift) && (!this.grid[i].isActive))
      if (!this.grid[i].isActive)
        this.findPath(i);
    },
    setFocus: function(i) {
      this.clearFocus();
      this.grid[i].isActive = true;
      console.log(i + ' was clicked');
      this.findPath(i);
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
          isHit: false,
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
    cleanGrid: function() {
      for (var i = 0; i < this.grid.length; i++) {
        this.grid[i].hasChar = false;
      }
    },
    setChars: function() {
      var str = this.$root.masterFEN;
      var self = this;
      this.cleanGrid();
      for (var i = 0; i < str.length; i++) {
        var curr = str[i];
        var type = self.charFromFirst(curr);
        // console.log(type);
        if (self.$root.rx.isWord.test(curr)) {
          self.grid[i].hasChar = true;
          var first = curr.charAt(0);
          self.grid[i].Char.health = 8;
          self.grid[i].Char.mana = 8;
          if (self.$root.rx.lowercase.test(first)) {
            self.grid[i].Char.color = 'red';
            self.grid[i].Char.team = 2;
          } else {
            self.grid[i].Char.color = 'white';
            self.grid[i].Char.team = 1;
          }
          if (type !== 'zing') {
            self.grid[i].Char.name = type;
          } else {
            self.grid[i].Char.name = 'king'
          }
        } else {
          // self.grid[i].Char.health = 0;
          // self.grid[i].Char.mana = 0;
          // self.grid[i].hasChar = false;
          // self.grid[i].Char.name = '1'
          // self.grid[i].Char.team = 0;
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
    // Event.$on('highlightMatches', self.highlightGrid)
    Event.$on('resetGridFocus', self.clearFocus)
    Event.$on('playerPaths', self.highlightPath)
  }
})


var app = new Vue({
  el: '#app',
  data: {
    ticks: 0,
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
    Event.$on('changeFEN', self.updateFEN)
    window.addEventListener('mousedown', function(evt) {
      self.parseModifiers(evt);
      self.isDragging = true;
    });
    window.addEventListener('mouseup', function(evt) {
      self.parseModifiers(evt);
      self.isDragging = false;
    });
    Event.$emit('changeFEN');
  },
  methods: {
    // dragstart_handler: function(ev) {
    //  console.log("dragStart");
    //  // Change the source element's background color to signify drag has started
    //  ev.currentTarget.style.backgroundColor = "red";
    //  // Set the drag's format and data. Use the event target's id for the data
    //  ev.dataTransfer.setData("text/plain", ev.target.id);
    // },
    // dragover_handler: function(ev) {
    //  console.log("dragOver");
    //  ev.preventDefault();
    // },
    // drop_handler: function(ev) {
    //   console.log("Drop");
    //   ev.preventDefault();
    //   // Get the data, which is the id of the drop target
    //   var data = ev.dataTransfer.getData("text");
    //   ev.target.appendChild(document.getElementById(data));
    //   // Clear the drag data cache (for all formats/types)
    //   ev.dataTransfer.clearData();
    // },
    updateFEN: function() {
      var targ = '';
      var storage = window.localStorage;
      if (this.$root.ticks < 1) {
        console.log('First');
        this.masterFEN = storage.getItem('masterFEN');
        targ = storage.getItem('masterFEN');
        this.$root.ticks++;
      } else {
        console.log('Else');
        this.masterFEN = this.uglified();
        targ = this.uglified();
        this.$root.ticks++;
      }

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
