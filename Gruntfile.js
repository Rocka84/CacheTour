module.exports = function (grunt) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jshint:{
			options: {
				node:true
			},
			src: ["source/*/*.js"],
			grunt: ["Gruntfile.js"]
		},
		concat: {
			options: {
				banner: grunt.file.read("templates/header.js.tpl"),
			},
			dist: {
				src: ["source/main.js", "source/class/*.js", "source/modules/*.js", "l10n/*.js", "source/initialize.js"],
				dest: "dist/<%= pkg.name %>.user.js"
			}
		},
		watch: {
			options: {
				nospawn: true
			},
			src: {
				files: ["source/*.js", "source/styles.css", "source/modules/*.js", "source/class/*.js", "l10n/*.js"],
				tasks: ["jshint:src", "dist"]
			},
			grunt: {
				files: ["Gruntfile.js"],
				tasks: ["jshint:grunt"]
			}
		}
	});

	function createFromTemplateFile(target_file, template_file, data) {
		grunt.file.write(target_file, grunt.template.process(grunt.file.read(template_file), {data: data||grunt.config.data}));
		return true;
	}

	function clone(object) {
		return JSON.parse(JSON.stringify(object));
	}

	grunt.task.registerTask("create_version_file",function() {
		return createFromTemplateFile("dist/" + grunt.config.data.pkg.name + ".version.js", "templates/version.js.tpl");
	});

	grunt.task.registerTask("create_dev_header_file",function() {
		var pkg = clone(grunt.config.data.pkg);
		pkg.userscript.require = pkg.userscript.require||[];
		pkg.userscript.require.push("file://" + process.cwd() + "/dist/" + grunt.config.data.pkg.name + ".user.js");
		return createFromTemplateFile("dist/" + grunt.config.data.pkg.name + ".dev_header.user.js", "templates/header.js.tpl", {pkg: pkg});
	});

	grunt.task.registerTask("create_js_from_css",function() {
		console.log("Don't look at me, I'm ugly!");
		var css = grunt.file.read("source/styles.css").split("\n").join("\\\n");
		return createFromTemplateFile("source/modules/010.styles.js", "templates/styles.js.tpl", {css: css});
	});

	grunt.task.registerTask("dist", ["create_js_from_css", "concat:dist", "create_version_file"]);

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["watch"]);

};

