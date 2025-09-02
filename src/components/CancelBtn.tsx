// components/PrimaryBtn.tsx
import { Button, ButtonProps } from '@rneui/themed';
import React from 'react';
import { primaryBtnColor, secondaryBtnColor } from '../helpers/colors';

export const CancelBtn: React.FC<ButtonProps> = (props) => (
  <Button
    buttonStyle={props.style}
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