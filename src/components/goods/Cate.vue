<template>
  <div>
   <!-- 面包屑导航 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
      :data="cateList"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      :show-index="true"
      index-text=""
      border
      >
      <!-- 是否有效 -->
      <template slot="isOk" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
        <i class="el-icon-error" v-else style="color:red"></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <!-- 操作 -->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete"  size="mini">删除</el-button>
      </template>
      </tree-table> 
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%"
  >
  <!-- 表单主体 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类：" >
    <el-cascader
   
    v-model="selectKeys"
    :options="parentCateList"
    :props="cascaderProps"
    @change="ptarentCateChanged"
    :change-on-select="true"></el-cascader>
  </el-form-item>
  </el-form>
  <!-- 按钮 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCateDialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>
<script>
export default {
  data(){
    return{
      // 查询条件
      queryInfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
    // 商品分类的数据列表，初始值为空
    cateList:[],
    // 总数据条数
    total:0,
    // 为table指定列的定义
    columns:[{
      label:'分类名称',
      prop:'cat_name'
    },{
      label:'是否有效',
      // 将当前列定义为模板列
      type:'template',
      // 表示当前这一列使用的模板名称
      template:'isOk'
    },{
      label:'排序',
      // 将当前列定义为模板列
      type:'template',
      // 表示当前这一列使用的模板名称
      template:'order'
    },{
      label:'操作',
      // 将当前列定义为模板列
      type:'template',
      // 表示当前这一列使用的模板名称
      template:'opt'
    }],
    // 控制分类对话框的显示与隐藏
    addCateDialogVisible:false,
    // 添加分类的表单数据对象
    addCateForm:{
      // 将要添加的分类名称
      cat_name:'',
      cat_pid :0,
      cat_level:0
    },
    // 验证规则
    addCateFormRules:{
      cat_name:[
        {required:true,message:'请输入分类名称',trigger:'blur'}
      ]
    },
    // 父级分类的列表
    parentCateList:[],
    // 指定级联选择器的配置对象
    cascaderProps:{
      expandTrigger:"hover",
      value:'cat_id',
      label:'cat_name',
      children:'children'
    },
    // 选中的父级分类id数组
    selectKeys:[]
    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    // 获取商品分类的数据
  async  getCateList(){
   const {data:res} =  await this.$http.get('categories',{params:this.queryInfo})
   if(res.meta.status !== 200){
     return this.$message.error('获取商品分类数据失败')
   }
   console.log(res.data)
  //  把获取到的数据列表赋值给cateList
   this.cateList = res.data.result
  //  将获取到的总数据条数赋值给total
   this.total = res.data.total
    },
    // 监听行数
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页数
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类的事件处理函数
    showAddCate(){
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 父级分类的事件处理函数
  async  getParentCateList(){
  const {data:res} =   await this.$http.get('categories',{params:{ type: 2 } })
    // console.log(res)
    if(res.meta.status !== 200){
      this.$message.error('获取父级分类数据失败')
    }
    // console.log(res.data)
    this.parentCateList = res.data
    },
    // 父级分类发生变化触发
    ptarentCateChanged(){
      console.log(this.selectKeys)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>