<template>
	<div id="app">
		<!-- <img src="./assets/logo.png"> -->

		<div class="container">
			<div class="row justify-content-center">
				<div class="col col-md-10 col-lg-8 col-xl-7">
					<router-view></router-view>

					<div class="d-flex justify-content-end">
						<a href="https://github.com/kjmagic13/florida-evacuation-shelters" class="small text-muted" target="_blank">
							<i class="fa fa-fw fa-github"></i>
						</a>
					</div>

				</div>
			</div>
		</div>

	</div>
</template>

<script>
export default {
	name: 'app'
}
</script>

<style>
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
</style>
