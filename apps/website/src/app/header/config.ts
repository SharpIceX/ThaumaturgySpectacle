import type { DefineComponent } from 'vue';
import HomeIcon from '@material-design-icons/svg/outlined/home.svg';
import StarsIcon from '@material-design-icons/svg/outlined/stars.svg';
import StyleIcon from '@material-design-icons/svg/outlined/style.svg';
import CategoryIcon from '@material-design-icons/svg/outlined/category.svg';
import HistoryEduIcon from '@material-design-icons/svg/outlined/history_edu.svg';
import DescriptionIcon from '@material-design-icons/svg/outlined/description.svg';
import AutoStoriesIcon from '@material-design-icons/svg/outlined/auto_stories.svg';
import ImportContactsIcon from '@material-design-icons/svg/outlined/import_contacts.svg';
import SpaceDashboardIcon from '@material-design-icons/svg/outlined/space_dashboard.svg';
import FormatListBulletedIcon from '@material-design-icons/svg/outlined/format_list_bulleted.svg';

interface BaseItem {
	label: string;
	icon: DefineComponent;
}

interface HeaderLinkItem extends BaseItem {
	link: string;
}

interface HeaderDropdownItem extends BaseItem {
	children: Array<{
		link: string;
		label: string;
		icon: DefineComponent;
	}>;
}

type HeaderItemType = HeaderLinkItem | HeaderDropdownItem;

interface HeaderType {
	left: HeaderItemType[];
	right: HeaderItemType[];
}

const header: HeaderType = {
	left: [
		{
			link: '/',
			label: '首页',
			icon: HomeIcon,
		},
		{
			label: '百科',
			icon: DescriptionIcon,
			children: [
				{
					link: '/wiki',
					label: '首页',
					icon: SpaceDashboardIcon,
				},
				{
					label: '分类',
					link: '/wiki/特殊页面/分类',
					icon: CategoryIcon,
				},
				{
					label: '所有页面',
					link: '/wiki/特殊页面/所有页面',
					icon: FormatListBulletedIcon,
				},
			],
		},
	],
	right: [
		{
			label: '小说',
			icon: HistoryEduIcon,
			children: [
				{
					link: '/novel',
					label: '首页',
					icon: AutoStoriesIcon,
				},
				{
					label: '分类',
					link: '/novel/特殊页面/分类',
					icon: StyleIcon,
				},
				{
					label: '所有页面',
					link: '/novel/特殊页面/所有页面',
					icon: ImportContactsIcon,
				},
			],
		},
		{
			label: '关于',
			link: '/about',
			icon: StarsIcon,
		},
	],
};

export default header;
export type { HeaderItemType, HeaderLinkItem, HeaderDropdownItem };
