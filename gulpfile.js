
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');

//script paths
var jsFiles = 'src/M.js src/M.Point.js src/M.Ellipse.js src/M.EllipticSector.js',
    jsDest = './',
    concatFilename = 'm.js';

gulp.task('concat', function() {
    var code = gulp.src(jsFiles)
        .pipe(concat('m.js'))
        .pipe(gulp.dest(jsDest));
    //console.log( code );
    return code;
});

gulp.task('uglify', function() {
    return gulp.src(concatFilename)
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(jsDest));
});

gulp.task('default', function() {
    return runSequence( 'concat', 'uglify' ); 
});

