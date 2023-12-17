/**
 * Calendar
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */

export default class Calendar {
  constructor(options = {}) {
    this.options = options;

    // 日本語表記の定義
    // 0: 1月, 1: 2月...なので注意
    this._months = [
      '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    if (this.options.startOnMon) {
      this._weeks = [
        '月', '火', '水', '木', '金', '土', '日'
      ];
    } else {
      this._weeks = [
        '日', '月', '火', '水', '木', '金', '土'
      ];
    }

    // 要素の定義
    this._elem = document.getElementById('calendar');
    this._prev = document.getElementById('calendarPrev');
    this._next = document.getElementById('calendarNext');
    this._prevText = document.getElementById('calendarPrevText');
    this._currentText = document.getElementById('calendarCurrentText');
    this._nextText = document.getElementById('calendarNextText');
    this._head = document.getElementById('calendarHead');
    this._body = document.getElementById('calendarBody');

    if (this.options.startOnMon) {
      this._elem.classList.add('--startOnMon');
    }

    // 年月の設定
    const today = new Date();
    this.year = this._elem.dataset.year - 0 || today.getFullYear();
    this.month = this._elem.dataset.month - 0 || today.getMonth();

    // 休日データを取得
    this.holidays = this._fetchHolidays();

    // カレンダーを作成
    this.makeCalendar(this.year, this.month);

    // 月送りの操作受付
    this._handleEvents();
  }

  async _fetchHolidays() {
    const url = 'https://holidays-jp.github.io/api/v1/date.json';
    const res = await fetch(`${url}`);
    return await res.json();

  }

  _handleEvents() {
    // 前月
    this._prev.addEventListener('click', (event) => {
      event.preventDefault();
      this.month--;
      if (this.month < 0) {
        this.year--;
        this.month = this._months.length - 1;
      }
      this.makeCalendar(this.year, this.month);
    });

    // 次月
    this._next.addEventListener('click', (event) => {
      event.preventDefault();
      this.month++;
      if (this.month > this._months.length - 1) {
        this.year++;
        this.month = 0;
      }
      this.makeCalendar(this.year, this.month);
    });
  }

  async makeCalendar(year, month) {
    // テキストラベルを変更
    this._changeLabels(year, month);
    // Headに曜日を記載
    this._makeCalendarHead();
    // Bodyに日にちを記載
    this._makeCalendarBody(year, month, await this.holidays);
  }

  _changeLabels(year, month) {
    this._prevText.textContent = this._months[(month + this._months.length - 1) % this._months.length];
    this._currentText.textContent = `${year}年 ${this._months[month]}`;
    this._nextText.textContent = this._months[(month + this._months.length + 1) % this._months.length];
  }

  _makeCalendarHead() {
    // 現在の中身を削除
    this._head.innerHTML = '';
    // 一週間の行を作成
    const tr = document.createElement('tr');
    for (let i = 0; i < 7; i++) {
      // 一日の列に曜日を記載
      const th = document.createElement('th');
      th.textContent = this._weeks[i];
      tr.appendChild(th);
    }
    this._head.appendChild(tr);
  }

  _makeCalendarBody(year, month, holidays) {
    const startDate = new Date(year, month); // 月の初日
    let startDay = startDate.getDay(); // 初日の曜日
    if (this.options.startOnMon) {
      startDay += 6;
      startDay %= 7;
    }
    const endDate = new Date(year, month + 1, 0); // 月の末日
    const endDayCount = endDate.getDate(); // 末日の日にち
    let dayCount = 1; // 日にちをカウント

    // 現在の中身を削除
    this._body.innerHTML = '';

    for (let j = 0; j < 6; j++) {
      // 一週間の行を作成
      const tr = document.createElement('tr');

      for (let i = 0; i < 7; i++) {
        //一日の列を作成
        const td = document.createElement('td');
        const div = document.createElement('div');
        div.classList.add('calendar__schedule');
        if (i < startDay && j === 0 || dayCount > endDayCount) {
          // 一週目で、初日の曜日に達するまでは空白
          // もしくは末日の日にちに達してからは空白
          div.innerHTML = '&nbsp;';
        } else {
          // 日にちを記載
          div.innerHTML = `<p>${dayCount}</p>`;
          // 日にち・曜日データをセット
          const date = this._parseDate(year, month, dayCount);
          div.dataset.date = date;
          const week = i;
          div.dataset.week = week;
          // 祝日クラスを付与
          if (date in holidays) {
            div.classList.add('--holiday');
            div.setAttribute('title', holidays[date]);
          }
          // 翌日へ
          dayCount++;
        }
        td.appendChild(div);
        tr.appendChild(td);
      }
      this._body.appendChild(tr);
    }
  }

  _parseDate(year, month, day) {
    return `${year}-${('00' + (month + 1)).slice(-2)}-${('00' + day).slice(-2)}`;
  }
}
