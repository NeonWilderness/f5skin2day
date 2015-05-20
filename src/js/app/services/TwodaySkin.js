'use strict';

module.exports = function($http, $q){

    return {

        get: function(url){

            /**
             * @param url: Twoday url to read
             * @returns: $http: promise
             *
             */

            return $http.get(url);

        },

        update: function(skin, param){

            /**
             * @param skin: object, at minimum holds the following props
             *      name: Name of the skin to be updated, e.g. "Site.usrPreferences"
             *      content: Content that shall be written to the skin
             *      status: Status field
             * @param param: holds the consolidated preferences
             * @returns status: string "updated" or "error~xxx" in skin.status
             *
             */

            var q = $q.defer();

            $http.get( param.layoutUrl+"skins/edit?key="+skin.name )

                .success(function(data){
                    var $form = $(data).find("form").eq(0);

                    $http({
                        method: $form.attr("method"),
                        url: $form.attr("action"),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                        data: $.param({
                            secretKey: $form.find("input[name=secretKey]").val(),
                            action: $form.find("input[name=action]").val(),
                            key: $form.find("input[name=key]").val(),
                            skinset: $form.find("input[name=skinset]").val(),
                            module: $form.find("input[name=module]").val(),
                            title: $form.find("input[name=title]").val(),
                            description: $form.find("textarea[name=description]").html(),
                            skin: skin.content,
                            save: $form.find("input[name=save]").val()
                        })
                    })

                    .success(function(){
                        skin.status = "updated";
                        q.resolve(skin);
                    })

                    .error(function(data, status){
                        skin.status = "error~"+status;
                        q.reject(status, skin);
                    });
                })

                .error(function(data, status){
                    skin.status = "error~"+status;
                    q.reject(status, skin);
                });

            return q.promise;

        }
    };
};