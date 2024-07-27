// hooks
// import useAuth from '../hooks/useAuth';
// utils
// import createAvatar from '../utils/createAvatar';
//
import { useSelector } from 'react-redux';
import Avatar from './Avatar';
import createAvatar from '../utils/createAvatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const user = useSelector((state: any) => state.auth.user);

  return (
    <Avatar
      src={user?.photoURL}
      // alt={user?.displayName}
       color={user?.photoURL ? 'default' : createAvatar(user?.first_name).color}
      {...other}
    >
      {createAvatar(user?.first_name).name}
    </Avatar>
  );
}
