import React from 'react'
import ReactDOM from 'react-dom'

import * as Service from './service'
import Main from './main'


document.addEventListener('DOMContentLoaded', function() {
	ReactDOM.render(<Main/>, document.getElementById('main'))
	Service.init()
})

import '../assets/icon/meeple-128.png'
import '../assets/icon/meeple-144.png'
import '../assets/icon/meeple-152.png'
import '../assets/icon/meeple-192.png'
import '../assets/icon/meeple-256.png'

import '../manifest.json'
