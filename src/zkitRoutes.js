import hcRequest from './hcRequest';

const zkitRoutes = {};

const zkitUrl = 'https://lcr5rln4b6.api.tresorit.io';
const adminId = 'admin@lcr5rln4b6.tresorit.io';
const adminKey = '6deb98ac3dc86087a546fa9aee0650555a3c9d1a879c818496f8ef8dad8c32d9';

zkitRoutes.intiUserRegistration = function () {
	return hcRequest('POST', `${zkitUrl}/api/v4/admin/user/init-user-registration`);
};

export default zkitRoutes;
