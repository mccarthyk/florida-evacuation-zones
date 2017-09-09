import Vue from 'vue'
import Router from 'vue-router'

import Hello from '@/components/Hello'
import Form from '@/components/Form'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'Form',
			component: Form
		}
	]
})