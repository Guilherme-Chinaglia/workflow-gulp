var gulp			= require("gulp");
var runSequence		= require("run-sequence");//garante a execução das task em uma ordem definida
var browserSync		= require("browser-sync").create();//as alterações são atualizadas automaticamente no browser, evitando a necessidade de atualizarmos a mesma (F-5)
var imagemin		= require("gulp-imagemin");
var del				= require("del");
var sass			= require("gulp-sass");
var autoprefixer	= require("gulp-autoprefixer");//versoin 3.1.1
var uglify			= require("gulp-uglify");
var htmlmin			= require("gulp-htmlmin");
var concat 			= require("gulp-concat");
var jshint 			= require("gulp-jshint");
var jshintStylish	= require("jshint-stylish");
var sizereport		= require("gulp-sizereport");


/*Exclui a pasta dist*/
gulp.task('clean:all', function(){
	return del([
		'dist/'
		]);
});

/* Tasks cached */
gulp.task("cache:css", function() {
	del("./dist/css/style.css")
});

gulp.task("cache:js", function() {
	del("./dist/js/app.js")
});

gulp.task("cache:html", function(){
	del(".dist/index.html")
});

/*
	Task imagemin
	Minificar PNG, JPEG, GIF and SVG
*/
gulp.task('build-img', function(){

	return gulp.src('src/img/**/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'))
});

/*
	- Task compilar arquivos SCSS para CSS
	- minificar css
	- prefixar  css
*/
gulp.task('sass', ['cache:css'], function() {
	
	return gulp.src('src/scss/style.scss')
		.pipe(
			sass({
					outputStyle: 'compressed'
				})
		.on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 5 versions']
		}))
		.pipe(gulp.dest('dist/css'))
});

/* 
	- Task concat-js para concatenar e minificar javascript dos componentes
*/
gulp.task("concat-js", function() {
	return gulp.src([
					'./src/components/jquery/dist/jquery.js',
					'./src/components/tether/dist/js/tether.js',
					'./src/components/bootstrap/dist/js/bootstrap.js'
				])
				.pipe(concat("main.js"))
				.pipe(uglify())
				.pipe(gulp.dest("./dist/js"))
});

/*Task mover pasta font awesome para fonts*/
gulp.task("move-fonts", function(){
	return gulp.src('./src/components/components-font-awesome/fonts/**')
		   .pipe(gulp.dest("./dist/fonts"))
});

/*
	- Task js para utilizar o uglify minifica o arquivo javascript e concatenar  
*/
gulp.task("js", ['cache:js'], function() {
	return gulp.src("./src/js/*.js")
				.pipe(concat("app.js"))
				.pipe(uglify())
				.pipe(gulp.dest("./dist/js/"))
});

/* Task minify html */
gulp.task("html", ['cache:html'], function() {
	return gulp.src("./src/index.html")
				.pipe(htmlmin({collapseWhitespace: true}))
				.pipe(gulp.dest("./dist"))
});

/*Task sizereport of the project*/
gulp.task('sizereport', function(){

	return gulp.src('dist/**/*')
			.pipe(sizereport({
				gzip:true
			}))
});

/*
	Task browserSync (o servidor local da sua máquina deverá estar startado também Ex: wamp, xamp, lamp, mamp ...etc)
	Verificar documentação do plugin para máquinas sem servidor local
*/
gulp.task('server', function(){

	browserSync.init({
		proxy: "localhost/workflow/dist",
		browser: "firefox"
	})

	//Watchers - arquivos que estão sendo monitorados
	gulp.watch('src/**/*').on('change', browserSync.reload);	

	//watch para monitorar e avisar sobre os arquivos javascript criados pelo desenvolvedor
	gulp.watch('src/js/*.js').on('change', function(event){
	console.log("Linting " + event.path);
	return gulp.src(event.path)
		.pipe(jshint())
		.pipe(jshint.reporter(jshintStylish, {beep: true}));
	 });

	gulp.watch('src/scss/style.scss', ['sass']);
	gulp.watch("./src/components/bootstrap/scss/**/*.scss", ['sass']);
	gulp.watch("./src/js/**/*.js", ['js']);
	gulp.watch("./src/index.html", ['html']);
});

/*
	Task default with runSequence 
	runSequence garante rodarmos as Tasks em uma ordem definida
*/
gulp.task('default', function(cb){

	return runSequence('clean:all','build-img',['sass', 'concat-js','move-fonts','js', 'html', 'server', 'size'], cb);
});