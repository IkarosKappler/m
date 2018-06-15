
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var del = require('del');

//script paths
var jsFiles = ['src/M.js', 'src/M.Point.js', 'src/M.Ellipse.js', 'src/M.EllipticSector.js', 'src/M.Matrix.js'],
    jsDest = './',
    concatFilename = 'm.js';

gulp.task('clean', function() {
    return Promise.all([
        del('m.js'),
        del('m.min.js')
    ]);
});

gulp.task('concat', function() {
    return gulp.src(jsFiles)
        .pipe(concat(concatFilename))
        .pipe(gulp.dest(jsDest));
});

gulp.task('uglify', function() {
    return gulp.src(jsDest+concatFilename)
	.pipe(uglify().on('error', function(e){
            console.log(e);
         }))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(jsDest));
});

gulp.task('default', function() {
    return runSequence( 'clean', 'concat', 'uglify' ); 
});

