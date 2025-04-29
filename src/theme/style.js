import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './color';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: 'white',
  },
  main: {
    // borderWidth:1,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: Colors.active,
    fontFamily: 'Poppins-SemiBold',
  },

  apptitle: {
    fontSize: 24,
    color: Colors.active,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.active,
  },
  m20: {
    fontSize: 20,
    color: Colors.active,
    fontFamily: 'Poppins-Medium',
  },
  s22: {
    fontSize: 22,
    color: Colors.active,
    fontFamily: 'Poppins-SemiBold',
  },
  s26: {
    fontSize: 26,
    color: Colors.active,
    fontFamily: 'Poppins-SemiBold',
  },
  m22: {
    fontSize: 22,
    color: Colors.active,
    fontFamily: 'Poppins-Medium',
  },

  r10: {
    fontSize: 10,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },
  r11: {
    fontSize: 11,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },

  r12: {
    fontSize: 12,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },
  i13: {
    fontSize: 13,
    color: Colors.active,
    fontFamily: 'Poppins-Regular',
  },
  i18: {
    fontSize: 18,
    color: Colors.active,
    fontFamily: 'Poppins-SemiBold',
  },
  s12: {
    fontSize: 12,
    color: Colors.disable,
    fontFamily: 'Poppins-SemiBold',
  },
  m12: {
    fontSize: 12,
    color: Colors.disable,
    fontFamily: 'Poppins-Medium',
  },
  b12: {
    fontSize: 12,
    color: Colors.disable,
    fontFamily: 'Poppins-Bold',
  },

  r14: {
    fontSize: 14,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },
  s14: {
    fontSize: 14,
    color: Colors.disable,
    fontFamily: 'Poppins-SemiBold',
  },
  m14: {
    fontSize: 14,
    color: Colors.disable,
    fontFamily: 'Poppins-Medium',
  },
  b14: {
    fontSize: 14,
    color: Colors.disable,
    fontFamily: 'Poppins-Bold',
  },

  r15: {
    fontSize: 15,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },
  s15: {
    fontSize: 15,
    color: Colors.disable,
    fontFamily: 'Poppins-SemiBold',
  },
  m15: {
    fontSize: 15,
    color: Colors.disable,
    fontFamily: 'Poppins-Medium',
  },

  r16: {
    fontSize: 16,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },
  s16: {
    fontSize: 16,
    color: Colors.disable,
    fontFamily: 'Poppins-SemiBold',
  },
  m16: {
    fontSize: 16,
    color: Colors.disable,
    fontFamily: 'Poppins-Medium',
  },
  b16: {
    fontSize: 16,
    color: Colors.disable,
    fontFamily: 'Poppins-Bold',
  },

  r18: {
    fontSize: 18,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },
  s18: {
    fontSize: 18,
    color: Colors.disable,
    fontFamily: 'Poppins-SemiBold',
  },
  m18: {
    fontSize: 18,
    color: Colors.disable,
    fontFamily: 'Poppins-Medium',
  },
  b18: {
    fontSize: 18,
    color: Colors.disable,
    fontFamily: 'Poppins-Bold',
  },

  icon: {
    height: 25,
    width: 30,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  btn: {
    backgroundColor: '#14B6AA',
    alignItems: 'center',
    height: 64,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'center',
  },
  btntxt: {
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: 'Poppins-SemiBold',
  },
  btnoutline: {
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
  },
  txtinput: {
    paddingHorizontal: 10,
    height: 64,
    borderRadius: 30,
    backgroundColor: '#F7F7F8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 64,
    borderColor: '#EBEBF0',
    borderWidth: 1,
  },

  indicator: {
    borderColor: '#BDBDBD',
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 5,
  },

  shadow: {
    shadowColor: Colors.active,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: Colors.bg,
  },

  radio: {
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    borderColor: Colors.bord,
    color: Colors.disable,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    borderWidth: 1,
  },

  divider1: {
    height: 1.5,
    backgroundColor: Colors.border,
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
  },

  dividertxt: {
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
  },

  btn1: {
    alignItems: 'center',
    // paddingVertical:15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 55,
  },
  btntxt1: {
    fontSize: 16,
    color: Colors.active,
    paddingLeft: 15,
    fontFamily: 'Poppins-Regular',
  },
  verticaldivider: {
    height: '60%',
    width: 1,
  },

  modalcontainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    // marginVertical: 140,
    paddingTop: 20,
    marginHorizontal: -10,
    alignSelf: 'center',
  },

  follow: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  following: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  categoryTextSelected: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: Colors.active,
    borderColor: Colors.active,
    color: Colors.secondary,
    fontFamily: 'Poppins-Regular',
  },
  categoryText: {
    fontSize: 14,
    color: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.input,
    borderRadius: 5,
    paddingBottom: 5,
    paddingTop: 7,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    fontFamily: 'Poppins-Regular',
  },
  categorycontainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  errorBox: {
    //    borderWidth:1,
    color: 'red',
    fontSize: 12,
    marginLeft: 28,
    marginTop: 5,
  },

  signupBox: {
    paddingHorizontal: 15,
    paddingVertical: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    borderWidth: 0.3,
    borderColor: '#14B6AA',
  },
  flexBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    height: '100%',
  },
  flexBoxRow: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
    // borderWidth:1
  },
  checkboxCont: {
    // width: 22,
    // height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  iconCircle: {
    top: -80,
    zIndex: 9,
    position: 'absolute',
    height: 114,
    width: 114,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurPic: {
    position: 'absolute',
    top: 0,
    height: 263,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCont: {
    borderWidth: 1,
    borderColor: '#14B6AA19',
    paddingHorizontal: 15,
    paddingVertical: 10,

    gap: 6,
  },
  smallIcons: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 14,
    height: 16,
    marginRight: 15,
  },
  editIcon: {
    width: 16,
    height: 16,
    opacity: 0.5,
  },
});
