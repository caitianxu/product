var pkgOrgList, order_top, updateShow, updateEnabled;
myApp.controller('videoClassifyController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //视频分类树
    services["_video_Classify_Tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/getTree', param, "POST");
    }
    //视频分类新增/修改
    services["_video_add"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/save_video_cat', param, "POST");
    }
    //视频分类删除
    services["_video_del"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/delete_video_cat', param, "POST");
    }
    //资讯分类 启用
    services["_cms_updateEnabled"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/json/updateEnabled', param, "POST");
    }
    //资讯分类 显示
    services["_cms_updateShow"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/json/updateShow', param, "POST");
    }

    //视频使用机构
    services["_video_Classify_getRemoveOrgs"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/json/orgList', param, "POST");
    }
    //视频使用机构-移除
    services["_video_Classify_removeOrg"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/json/removeOrg', param, "POST");
    }
    //视频使用机构-添加
    services["_video_Classify_addOrg"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/videoCat/json/addOrg', param, "POST");
    }


    $scope.tableControl = {
        config: {
            lines: true,
            check: true,
            param: {
                pages: 1, //总页数
                pageNum: 1, //当前页
                pageSize: 10, //每页条数
                total: 0, //总条数
                searchText: null
            },
            columns: [
                {field: 'video_cat_name', title: "名称", align: 'left'},
                {field: 'create_time', title: "创建时间"},
                {
                    field: 'is_show', title: "是否显示",
                    formatter: function (value, row, index) {
                        var bool = row.is_show == 1 ? 'layui-form-onswitch' : '';
                        return '<div class="layui-unselect layui-form-switch ' + bool + '" onclick="updateShow(' + row.video_cat_id + ', event)"><i></i></div>';
                    }
                },
                {
                    field: 'enabled', title: "是否启用",
                    formatter: function (value, row, index) {
                        var bool = row.enabled == 1 ? 'layui-form-onswitch' : '';
                        return '<div class="layui-unselect layui-form-switch ' + bool + '" onclick="updateEnabled(' + row.video_cat_id + ', event)"><i></i></div>';
                    }
                },
                {
                    field: 'org_count', title: "使用机构", formatter: function (value, row, index) {
                    return '<a href="javascript:void(0)" style="display: block" onclick="pkgOrgList(' + row.video_cat_id + ', event)">' + value + '</a>'
                }
                },
                {
                    field: 'other', title: "操作", formatter: function (value, row, index, data) {
                    var action = "";
                    if (index > 0 && data.length > 1) {
                        action += '<a href="javascript:void(0)" class="btn-icon" title="排序置顶" onclick="order_top(' + row.video_cat_id + ',' + index + ',\'top\', event)"><i class="iconfont icon-dingbu"></i></a>';
                        action += '<a href="javascript:void(0)" class="btn-icon" title="排序上升" onclick="order_top(' + row.video_cat_id + ',' + index + ',\'up\', event)"><i class="iconfont icon-shangsheng1"></i></a>';
                    }
                    if (index < data.length - 1) {
                        action += '<a href="javascript:void(0)" class="btn-icon" title="排序下降" onclick="order_top(' + row.video_cat_id + ',' + index + ',\'down\', event)"><i class="iconfont icon-xiajiang"></i></a>';
                    }
                    return '<span>'+ action +'</span>';
                }
                }
            ]
        },
        reload: function (param) {
            if ($rootScope._USERINFO.org_id != 1 && spliceBool) {
                spliceBool = false;
                $scope.tableControl.config.columns.splice(3, 1)
                $scope.tableControl.config.columns.splice(3, 1)
            }
            $scope.load()
        }
    };

    var spliceBool = true;
    //所有项目
    $scope.allProject = null;
    //数据列表
    $scope.fenpeiDataArray = null;
    //查询分配参数
    $scope.fenpeiParam = {
        video_cat_id: null,
        project_id: null,
        searchtext: null,
        pageNum: 1,
        pageSize: 10,
        pages: 1
    }
    $scope.fenpeiParamCol = {
        project_id: null,
        project_name: '所有项目',
        searchtext: null
    }

    //添加分配
    $scope.add_cat_org = function (row) {
        row.video_cat_id = $scope.fenpeiParam.video_cat_id;
        services._video_Classify_addOrg(row).success(function (res) {
            if (res.code == 0) {
                $scope._fenpeiData($scope.fenpeiParam.pageNum);
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //移除分配
    $scope.remove_org_cat = function (row) {
        services._video_Classify_removeOrg(row).success(function (res) {
            if (res.code == 0) {
                $scope._fenpeiData($scope.fenpeiParam.pageNum);
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //获取分配结构数据列表
    $scope._fenpeiData = function (num) {
        if (num) {
            $scope.fenpeiParam.pageNum = num;
        }
        else {
            $scope.fenpeiParam.pageNum = 1;
            $scope.fenpeiParam.project_id = $scope.fenpeiParamCol.project_id;
            $scope.fenpeiParam.searchtext = $scope.fenpeiParamCol.searchtext;
        }
        services._video_Classify_getRemoveOrgs($scope.fenpeiParam).success(function (res) {
            $scope.fenpeiDataArray = res.data.rows;
            //更新总页数
            $scope.fenpeiParam.pages = res.data.pages;
        })
    }
    //分类分配
    pkgOrgList = function (cat_id, event) {
        $rootScope.stopEvent(event);
        //打开层
        $scope.layer_export = layer.open({
            type: 1,
            title: "分类使用机构",
            area: ["700px", "600px"],
            content: $("#video_org")
        });
        $scope.fenpeiParam = {
            video_cat_id: cat_id,
            project_id: null,
            searchtext: null,
            pageNum: 1,
            pageSize: 10,
            pages: 1
        }
        $scope.fenpeiParamCol = {
            project_id: null,
            project_name: '所有项目',
            searchtext: null
        }
        //查询所有项目
        if (!$scope.allProject) {
            services._project().success(function (res) {
                $scope.allProject = res.data;
            })
        }
        //执行查询
        $scope._fenpeiData();
    }
    //是否启用
    updateEnabled = function (video_cat_id, event) {
        $rootScope.stopEvent(event);
        angular.forEach($scope.tableControl.data, function (item, index) {
            if (item.video_cat_id == video_cat_id) {
                $scope.selRow = item;
            }
        });
        if ($scope.selRow.enabled == 1) {
            $scope.selRow.enabled = 2;
        } else {
            $scope.selRow.enabled = 1;
        }
        services._cms_updateEnabled($scope.selRow).success(function (res) {
            if (res.code == 0) {
                layer.msg(res.message);
                selNode = $("#comTree").tree("getSelected");
                $scope.load();
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //是否显示
    updateShow = function (video_cat_id, event) {
        $rootScope.stopEvent(event);
        angular.forEach($scope.tableControl.data, function (item, index) {
            if (item.video_cat_id == video_cat_id) {
                $scope.selRow = item;
            }
        });
        if ($scope.selRow.is_show == 1) {
            $scope.selRow.is_show = 2;
        } else {
            $scope.selRow.is_show = 1;
        }
        services._cms_updateShow($scope.selRow).success(function (res) {
            if (res.code == 0) {
                layer.msg(res.message);
                selNode = $("#comTree").tree("getSelected");
                $scope.load();
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //改变排序
    order_top = function (video_cat_id, index, type, event) {
        $rootScope.stopEvent(event);
        angular.forEach($scope.tableControl.data, function (item, index) {
            if (item.video_cat_id == video_cat_id) {
                $scope.selRow = $scope.tableControl.data[index]
            }
        })
        if (type == 'up') {
            var row_last = $scope.tableControl.data[index - 1];
            $scope.selRow.order_weight = parseInt(row_last.order_weight) + 1;
        }
        else if (type == 'down') {
            var row_last = $scope.tableControl.data[index + 1];
            $scope.selRow.order_weight = parseInt(row_last.order_weight) - 1;
        }
        else {
            $scope.selRow.order_weight = (new Date()).getTime();
        }
        services._video_add($scope.selRow).success(function (res) {
            if (res.code == 0) {
                $scope.load();
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    $scope.selRow = {}
    var selNode = null;
    $("#comTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            selNode = node;
            $scope.tableControl.loadData(node);
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#comTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#comTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#comTree").tree("getRoot");
            }
            $("#comTree").tree("select", selNode.target);

            //查找未分配的分类
            var unNode = $("#comTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    $("#resTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.selRow.pid = node.id;
            $scope.selRow.parent_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#resTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#resTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#resTree").tree("getRoot");
            }
            $("#resTree").tree("select", selNode.target);
            //查找未分配的分类
            var unNode = $("#resTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    function changeTreeStyle1(treeNode) {
        if (!treeNode['children'] || treeNode['children'].length == 0) {
            treeNode['res_icon'] = 'tree-folder';
        }
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                changeTreeStyle1(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.video_cat_name;
        treeNode["id"] = treeNode.video_cat_id;
    }

    //加载
    $scope.load = function () {
        services._video_Classify_Tree().success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                video_cat_name: "所有资源",
                video_cat_id: 0,
                children: arrdata
            }]
            $("#comTree").tree("loadData", allData);
        })
    }
    //新增
    $scope.addRow = function () {
        $scope.selRow = {
            pid: selNode.id,
            parent_name: selNode.text
        }
        $scope.status = true
        $rootScope.formOpen();
        services._video_Classify_Tree().success(function (res) {
            var arrdata = [];

            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                video_cat_name: "所有资源",
                video_cat_id: 0,
                children: arrdata
            }]
            selNode = $("#comTree").tree("getSelected");
            $("#resTree").tree("loadData", allData);
        })
    }
    //修改
    $scope.row_update = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要修改的数据");
            return false
        }
        if (ids.length > 1) {
            layer.alert("同时只能修改一条数据");
            return false
        }
        $scope.status = false
        $rootScope.formOpen();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
            }
        })
        services._video_Classify_Tree().success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                video_cat_name: "所有资源",
                video_cat_id: 0,
                children: arrdata
            }]
            selNode = $("#comTree").tree("getSelected");
            $("#resTree").tree("loadData", allData);
            //隐藏当前节点
            var nowNN = $("#resTree").tree("find", $scope.selRow.video_cat_id);
            $("#resTree").tree("remove", nowNN.target);
        })
    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.video_cat_name) {
            layer.alert("请填写分类名称")
            return false;
        }
        var id = -1;
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                id = $scope.tableControl.data[item.index].video_cat_id
            }
        });
        if ($scope.selRow.pid == $scope.selRow.video_cat_id) {
            layer.alert('请选择正确的父级')
            return false;
        }
        if (!$scope.selRow.order_weight) {
            $scope.selRow.order_weight = (new Date()).getTime();
        }
        services._video_add($scope.selRow).success(function (res) {
            if (res.code == 0) {
                if (bool) {
                    $rootScope.formClose();
                }
                else {
                    $scope.selRow = {
                        pid: $scope.selRow.pid,
                        parent_name: $scope.selRow.parent_name
                    };
                }
                $scope.load();
                layer.msg('信息保存成功');
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //删除
    $scope.delRow = function () {
        var video_cat_ids = new Array();
        var mark = null;
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                video_cat_ids.push($scope.tableControl.data[item.index].video_cat_id)
            }
        });
        if (video_cat_ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._video_del({video_cat_ids: video_cat_ids, mark: mark}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg("删除成功")
                        $scope.load();
                    }
                    else if (res.code == 1) {
                        layer.confirm(res.message, {
                            btn: ['确定', '取消']
                        }, function () {
                            mark = 'del'
                            services._video_del({video_cat_ids: video_cat_ids, mark: mark}).success(function (res) {
                                if (res.code == 0) {
                                    layer.msg("删除成功")
                                    $scope.load();
                                }else{
                                    layer.msg(res.message)
                                }
                            })
                        })
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }
});