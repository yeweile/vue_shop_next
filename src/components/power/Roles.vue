<template>
  <div>
    <!-- 面包屑导航 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 渲染权限 -->
            <el-row v-for="(item1 , i1) in scope.row.children" :key="item1.id" :class="['bdbottom',i1 === 0 ? 'bdtop':'','vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightBtId(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 使用v-for嵌套 渲染二级权限 -->
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2 === 0 ?'':'bdtop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightBtId(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag v-for="(item3,i3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightBtId(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
            
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作"  width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning"   icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
     width="50%"
     @close="setRightDialogClosed"
    >
    <!-- 树型控件 -->
    <el-tree :data="rightsList" :props="treeProps"  show-checkbox node-key="id" :default-expand-all="true"
    :default-checked-keys="defKeys" ref="treeRef"></el-tree>
    <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data(){
      return{
        // 获取角色列表数据
        rolesList:[],
        // 控制分配权限的对话框的打开与关闭
        setRightDialogVisible:false,
        // 所有权限的数据
        rightsList:[],
        // 树型控件的数型绑定对象
        treeProps:{
          label:'authName',
          children:'children'
        },
        // 默认选中的节点值数组
        defKeys:[],
        // 当前即将分配角色的id
        roleId:''
      }
  },
  created(){

    this.getRolesList()
  },
  methods:{
    // 获取权限列表
   async getRolesList(){
   const {data:res} =  await this.$http.get('roles')
    
    if(res.meta.status !== 200){
      return this.$message.error('获取角色列表失败')
    }
    this.rolesList = res.data
    console.log(this.rolesList)
    },
    // 根据id删除对应的权限
    async  removeRightBtId(role,rightId){
      // 弹框提示用户是否要删除
    const confirmResult =  await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err =>err)
        if(confirmResult !== 'confirm'){
          return this.$message.info('已取消删除')
        }
        // console.log('确认删除')
    const {data:res} =   await this.$http.delete( `roles/${role.id}/rights/${rightId}`)
    console.log(res)
    if(res.meta.status !== 200){
      return this.$message.error('删除权限失败')
    }
    // 如果状态码是200
    // 刷新权限列表
    // this.getRolesList()
    
    role.children = res.data
    this.$message.success('删除权限成功')
    },
    // 分配权限事件处理函数对话框
    async  showSetRightDialog(role){
      this.roleId  = role.id
      // 获取权限数据
  const {data:res} =  await  this.$http.get('rights/tree')
    if(res.meta.status !== 200){
      return this.$message.error('获取权限列表失败')
    }
    console.log('成功')
    this.rightsList = res.data
    console.log(this.rightsList)
    // 调用递归
    this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式获取所有三级权限的id,
    // 并保存到defKeys:[]数组中
    getLeafKeys(node,arr){
      // 如果当前node节点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      // 使用递归
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });
    },
    // 监听关闭对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys=[]
    },
// 点击为角色分配权限
   async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys) 
      // 将得到的id拼接成字符串的形式
      const idStr = keys.join(',')

  const {data:res} =  await  this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
    if(res.meta.status !== 200){
      return this.$message.error('分配权限失败')
    }
    console.log(res)
    this.$message.success('分配权限成功')
     this.getRolesList()
     this.setRightDialogVisible = false 
    }

  } 
  
}
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bdtop{
    border-top: 1px solid #eee;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>