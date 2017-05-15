import React from 'react'
import { connect } from 'react-redux'
import Locale from 'react-redux-boilerplate-js/libs/decorator/Locale'
import PageTitle from 'react-redux-boilerplate-js/libs/decorator/PageTitle'
import BreadCrumb from 'react-redux-boilerplate-js/libs/decorator/BreadCrumb'

//BreadCrumb must before redux @connect,it's different from layout view
//in the array,you can custom the fields. you can also use function.
//you can get the breadcrumb lists in layout view by 'this.getBreadCrumbs()'
//when using @BreadCrumb decorator
//BreadCrumb.create must be used in second route page view component or it works nothing.
@BreadCrumb.create([
  {
    label: '关于',
    //the field depends on you.
    link: '/about',
  },
])
//connect to redux store,refer to redux.
@connect((state)=>{
  return {
  };
})
//set page title
@PageTitle("关于")
//muti-language decorator,it's different from the first route layout view component.
//it provides `this.t(xxx)` to the component.
//if you want the locale function worked,you must use `this.t(xxx)` to pass the string.
//you can use `npm run view-locale-to-excel` to generate the default language excel lists.
//you can use `npm run excel-to-locale-config` to generate the default language javascirpts array lists.
//refer to the api.
@Locale
//the view is the second route page veiw component.
//you can eidit `./_route.js` file to change the url path for the current page.
class AboutView extends React.Component {

  render() {
    return (
      <div>
        <h1>{ this.t('关于') }</h1>
        { this.t('开始编写, 请编辑 src/view/about/index.jsx.') }
        <br/>
        { this.t('保存文件时，将自动更新到浏览器。') }
      </div>
    )
  }
}

export default AboutView;
