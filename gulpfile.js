var gulp         = require('gulp'), // Подключаем Gulp
    pug          = require('gulp-pug'),
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync  = require('browser-sync'), // Подключаем Browser Sync 
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
    gulpStylelint = require('gulp-stylelint');

gulp.task('pug', function() {
    return gulp.src('src/index.pug')
        .pipe(pug({
            pretty: true
        }))
    .pipe(gulp.dest('src'))
});

gulp.task('sass', function() { // Создаем таск Sass
    return gulp.src('src/scss/**/*.scss') // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('src/css')) // Выгружаем результата в папку src/css
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'src' // Директория для сервера - src
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('lint-css', function() {
    return gulp
      .src('src/**/*.scss')
      .pipe(gulpStylelint({
        reporters: [
          {formatter: 'string', console: true}
        ]
      }));
  });

gulp.task('scripts', function() {
    return gulp.src( // Берем все необходимые библиотеки
        'src/libs/jquery.min.js'
        )
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('src/scripts')); // Выгружаем в папку src/js
});

gulp.task('code', function() {
    return gulp.src('src/*.html')
        .pipe(browserSync.reload({ stream: true }))
});

// gulp.task('css-libs', function() {
//     return gulp.src([
//             'src/libs/slick/slick.css'
//         ]) // Выбираем файл для минификации
//         .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
//         .pipe(cssnano()) // Сжимаем
//         .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
//         .pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
// });

gulp.task('clean', async function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('src/img/**/*') // Берем все изображения из src
        .pipe(cache(imagemin({ // С кешированием
        // .pipe(imagemin({ // Сжимаем изображения без кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))/**/)
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('prebuild', async function() {

var buildCss = gulp.src( // Переносим библиотеки в продакшен
    'src/css/style.css'
    )
    .pipe(gulp.dest('dist/css'))

var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
    return cache.clearAll();
})

gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', gulp.parallel('sass')); // Наблюдение за sass файлами
    gulp.watch('src/*.pug', gulp.parallel('pug'));
    gulp.watch('src/*.html', gulp.parallel('code')); // Наблюдение за HTML файлами в корне проекта
    gulp.watch(['src/scripts/main.js', 'src/libs/**/*.js'], gulp.parallel('scripts')); // Наблюдение за главным JS файлом и за библиотеками
});

gulp.task('default', gulp.parallel('pug', 'sass', 'scripts',  'lint-css', 'browser-sync', 'watch')); // + css-libs scripts
gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', 'sass')); // + scripts