import HomePage from '../pages/home-page/home-page';
import DetailPage from '../pages/detail-page/detail-page';
import AddPage from '../pages/add-page/add-page';
import AboutPage from '../pages/about-page/about-page';
import LoginPage from '../pages/login-page/login-page';
import RegisterPage from '../pages/register-page/register-page';

const routes = {
  '/': new HomePage(),
  '/detail/:id': new DetailPage(),
  '/add': Object.assign(new AddPage(), { needsAuth: true }),
  '/about': new AboutPage(),
  '/login': new LoginPage(),         
  '/register': new RegisterPage(),  
};

export default routes;