# nodecms
This was originally meant to be a barebones CMS using only Node.JS and not using "middleware" like Express. 
The idea being that it was meant to teach myself how to do things the Node.JS way. 
As I got further along I realized I needed to add a proxy server and decided to abandon this project.

The next iteration will be posted to a private repo that will be available upon request.

Keep in mind two things about this project:
1) This code is not guaranteed to work because it was very experimental.
2) This code is not meant to be taken as production worthy.

The first official iteration of my node CMS will have the following attributes:
1) Nginx providing load balancing, primary front end delivery, and SSL functionality.
2) A backend powered by Node.JS, Memcache, Gearman, and MongoDB.
3) A REST API to deliver all content upon request. 
4) An AngularJS-based admin area to edit content.
5) A customized Node.JS front-end.
