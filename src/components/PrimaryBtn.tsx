// components/PrimaryBtn.tsx
import { Button, ButtonProps } from '@rneui/themed';
import React from 'react';
import { primaryBtnColor } from '../helpers/colors';

export const PrimaryBtn: React.FC<ButtonProps> = (props) => (
  <Button
    buttonStyle={{
      backgroundColor: primaryBtnColor,
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