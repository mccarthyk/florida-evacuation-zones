<template>
	<form @submit.prevent="findAddress()" method="get">

		<h1 class="my-4 text-center">
			{{ title }}
		</h1>

		<!-- <button @click="getLocation()">Geo</button> -->

		<div class="input-group input-group-lg my-3">
			<input type="text" v-model="addressInput" class="form-control" placeholder="Address, City, State" required>
			<span class="input-group-btn">
				<button class="btn btn-dark" type="submit">Go!</button>
			</span>
		</div>

		<section class="card my-3 p-2">
			<article v-if="result" class="text-center bg-dark text-light p-3">
				<p class="h4 mb-4 text-muted">
					Evacuation Zone
				</p>
				<p class="h1 my-3">
					{{ result.EZone }}
				</p>
				<small>
					{{ geometry.address }}<br>
				</small>
			</article>

			<p>
				<h5>
					Status:
					<span v-if="loading" class="fa fa-spinner fa-pulse fa-1x fa-fw"></span>
				</h5>
				<ul class="list-inline mb-0">
					<li v-for="text in status" class="list-inline-item status-list-inline-item mr-3 text-muted small">{{ text }}</li>
				</ul>
			</p>
			<details class="bg-light p-3">
				<h6 class="mt-4 font-weight-bold">
					Address:
					<small v-if="addressSingleLine">({{ addressSingleLine }})</small>
				</h6>
				<pre v-if="geometry">{{ geometry.address }}</pre>

				<h6 class="mt-4 font-weight-bold">Spatial Geometry:</h6>
				<pre v-if="geometry">{{ geometry.location }}</pre>

				<h6 class="mt-4 font-weight-bold">Zone:</h6>
				<pre>{{ result }}</pre>

				<h6 class="mt-4 font-weight-bold">Source:</h6>
				<a :href="endpointSrc" v-if="true" v-text="endpointSrc" class="small text-muted" target="_blank"></a>
				<select v-else v-model="endpointSrc" class="form-control form-control-sm">
					<option value=""></option>
					<option value="https://services.arcgis.com/3wFbqsFPLeKqOlIK/ArcGIS/rest/services/EVACUATION_ZONES/FeatureServer/0">Florida</option>
					<option value="https://services.arcgis.com/apTfC6SUmnNfnxuF/arcgis/rest/services/Evacuation_Zones/FeatureServer/0">Hillsborough County, FL</option>
				</select>

			</details>
		</section>

	</form>
</template>

<script>
import * as esriLoader from 'esri-loader'

export default {
	name: 'form',
	data () {
		return {
			title: 'Florida Evacuation Zones',
			// addressInput: '601 e kennedy blvd, tampa',
			addressInput: '',
			addressSingleLine: null,
			loading: false,
			status: [],
			geometry: null,
			result: null,
			endpointSrc: 'https://services.arcgis.com/3wFbqsFPLeKqOlIK/ArcGIS/rest/services/EVACUATION_ZONES/FeatureServer/0'
		}
	},
	methods: {
		getLocation () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(this.showPosition);
			} else {
				console.log("Geolocation is not supported by this browser.");
			}
		},
		showPosition(position) {
			console.log(position);
		},
		findAddress () {
			this.loading = true
			this.status = []
			this.status.unshift('Finding address')
			this.geometry = null
			this.result = null
			this.addressSingleLine = this.addressInput

			return new Promise((resolve, reject) => {
				esriLoader.dojoRequire([
					"esri/tasks/Locator",
					"esri/widgets/Track"
				], (Locator, Track) => {
					var hcLocator = new Locator({
						url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
						outSpatialReference: {wkid: 102100}
					})

					var trackWidget = new Track({
					});

					console.log(trackWidget.start());

					hcLocator.addressToLocations({
						address: { SingleLine: this.addressSingleLine },
						maxLocations: 1,
						countryCode: 'US'
					}).then( response => {
						if (response.length) {
							this.geometry = response[0]
							this.status.unshift('Address found...')
							this.fetchZone().then(p => {
								resolve(true)
							})
						} else {
							throw 'address-not-found'
						}
					}).otherwise( err => {
						this.loading = false
						this.status.unshift('Address not found...')
						console.error(err)
						resolve(false)
					})
				});
			})
		},
		fetchZone () {
			return new Promise( (resolve, reject) => {
				esriLoader.dojoRequire([
					"esri/tasks/QueryTask",
					"esri/tasks/support/Query"
				], (QueryTask, Query) => {

					var query = new Query()

					query.geometry = this.geometry.location
					query.returnGeometry = false
					query.outFields = ['*']

					var queryTask = new QueryTask({
						url: this.endpointSrc
					})

					this.status.unshift('Querying Spatial Geometry')

					queryTask.execute(query).then(response => {
						if (response.features.length) {
							this.status.unshift('Evacuation Zone Found')
							this.result = response.features[0].attributes
							this.loading = false
							resolve(true)
						} else {
							throw 'zone-not-found'
						}
					}).otherwise(err => {
						this.loading = false
						this.status.unshift(`Evacuation Zone could not be determined for ${this.geometry.address}. You may not be in an Evacuation Zone. Try again and be sure to include your full address.`)
						console.error(err)
						resolve(false)
					})
				});

			})
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="css">
.status-list-inline-item:first-child {
	color: #000 !important;
	font-size: 1em;
	font-weight: bold;
}
</style>
