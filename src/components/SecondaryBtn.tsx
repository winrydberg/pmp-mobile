// components/PrimaryBtn.tsx
import { Button, ButtonProps } from '@rneui/themed';
import React from 'react';
import { primaryBtnColor, secondaryBtnColor } from '../helpers/colors';

export const SecondaryBtn: React.FC<ButtonProps> = (props) => (
  <Button
    buttonStyle={{
      backgroundColor: secondaryBtnColor,
      // borderRadius: 8,
      paddingVertical: 10,
    }}
    titleStyle={{
      color: 'white',
      fontWeight: '600',
    }}
    containerStyle={{
      marginVertical: 8,
    }}
    {...props}
  />
);