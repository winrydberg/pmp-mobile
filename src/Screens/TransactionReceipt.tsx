import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    PermissionsAndroid,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import {Button, Text} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../types/navigation';
import {primaryBtnColor} from '../helpers/colors';
import Toast from 'react-native-toast-message';
import {TransactionItem} from '../Types/Transaction';
import {baseURL} from '../helpers/constants';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface TransactionReceiptProps {
    route: {
        params: {
            transaction: TransactionItem;
        };
    };
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({route}) => {
    const {transaction} = route.params;
    const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

    const [loading, setLoading] = useState<boolean>(true);
    const [pdfPath, setPdfPath] = useState<string>('');
    const [downloading, setDownloading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-20)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchPdfReceipt();

        // Start entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for loading state
        if (loading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPdfReceipt = async () => {
        try {
            setLoading(true);

            const transactionId = transaction.EqUuid || transaction.id;
            const url = `${baseURL}/api/transactions/${transactionId}/receipt/download`;

            console.log('Fetching PDF from:', url);

            // Get auth token from AsyncStorage
            const authDataString = await AsyncStorage.getItem('authData');
            let token = null;
            if (authDataString) {
                const authData = JSON.parse(authDataString);
                token = authData.token;
            }

            // Download the PDF file
            const {dirs} = ReactNativeBlobUtil.fs;
            const downloadPath = `${dirs.DocumentDir}/receipt-${transactionId}.pdf`;

            const response = await ReactNativeBlobUtil.config({
                path: downloadPath,
                fileCache: true,
            }).fetch(
                'GET',
                url,
                token
                    ? {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/pdf',
                      }
                    : {'Content-Type': 'application/pdf'}
            );

            const statusCode = response.info().status;

            if (statusCode === 200) {
                const path = response.path();
                console.log('PDF downloaded to:', path);
                setPdfPath(path);
                setLoading(false);
            } else {
                throw new Error(`Failed to download PDF. Status: ${statusCode}`);
            }
        } catch (err: any) {
            console.error('Error fetching PDF:', err);
            setLoading(false);

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.message || 'Could not load receipt PDF',
            });
        }
    };

    const handleGoBack = () => {
        // Clean up the downloaded file
        if (pdfPath) {
            ReactNativeBlobUtil.fs.unlink(pdfPath).catch((err) => {
                console.error('Error deleting PDF:', err);
            });
        }
        navigation.goBack();
    };

    const handleShare = async () => {
        if (!pdfPath) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No PDF available to share',
            });
            return;
        }

        try {
            const shareOptions = {
                title: 'Transaction Receipt',
                message: `Transaction Receipt - ${transaction.EqUuid}`,
                url: Platform.OS === 'android' ? `file://${pdfPath}` : pdfPath,
                type: 'application/pdf',
                subject: 'Transaction Receipt',
            };

            await Share.open(shareOptions);
        } catch (error: any) {
            if (error.message !== 'User did not share') {
                console.error('Error sharing PDF:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to share PDF',
                });
            }
        }
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                if (Platform.Version >= 33) {
                    // Android 13 and above don't need storage permission for app-specific directories
                    return true;
                }

                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'App needs access to storage to download the PDF',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleDownload = async () => {
        if (!pdfPath) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No PDF available to download',
            });
            return;
        }

        try {
            setDownloading(true);

            // Request permission
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: 'Storage permission is required to download PDF',
                });
                setDownloading(false);
                return;
            }

            const {dirs} = ReactNativeBlobUtil.fs;
            const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
            const fileName = `receipt-${transaction.EqUuid || transaction.id}.pdf`;
            const downloadPath = `${downloadDir}/${fileName}`;

            // Copy file to downloads folder
            await ReactNativeBlobUtil.fs.cp(pdfPath, downloadPath);

            setDownloading(false);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `PDF saved to ${Platform.OS === 'ios' ? 'Files' : 'Downloads'}`,
            });

            // On Android, make the file visible in Downloads
            if (Platform.OS === 'android') {
                await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
                    {
                        name: fileName,
                        parentFolder: '',
                        mimeType: 'application/pdf',
                    },
                    'Download',
                    downloadPath
                );
            }
        } catch (error: any) {
            console.error('Error downloading PDF:', error);
            setDownloading(false);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to download PDF',
            });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Animated.View
                    style={[
                        styles.loadingContent,
                        {
                            opacity: fadeAnim,
                            transform: [{scale: pulseAnim}],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#4A90C4', '#34B87C']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.loadingIconContainer}
                    >
                        <Feather name="file-text" size={48} color="white" />
                    </LinearGradient>
                    <ActivityIndicator size="large" color="#4A90C4" style={styles.loadingSpinner} />
                    <Text style={styles.loadingTitle}>Loading Receipt</Text>
                    <Text style={styles.loadingSubtitle}>Please wait while we prepare your receipt...</Text>
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{translateY: slideAnim}],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#FFFFFF', '#F9FAFB']}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    style={styles.headerGradient}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                        activeOpacity={0.7}
                    >
                        <View style={styles.backButtonContent}>
                            <Feather name="arrow-left" size={22} color="#1F2937" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.centerInfo}>
                        {totalPages > 0 && (
                            <View style={styles.pageIndicator}>
                                <Feather name="file-text" size={14} color="#4A90C4" />
                                <Text style={styles.pageInfo}>
                                    Page {currentPage} of {totalPages}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleShare}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={['#4A90C4', '#34B87C']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.iconButtonGradient}
                            >
                                <Feather name="share-2" size={18} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleDownload}
                            disabled={downloading}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={downloading ? ['#9CA3AF', '#6B7280'] : ['#34B87C', '#2DA771']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.iconButtonGradient}
                            >
                                {downloading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Feather name="download" size={18} color="white" />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            <Animated.View
                style={[
                    styles.pdfContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{scale: scaleAnim}],
                    },
                ]}
            >
                {pdfPath ? (
                    <View style={styles.pdfWrapper}>
                        <Pdf
                            trustAllCerts={false}
                            source={{
                                uri: `file://${pdfPath}`,
                                cache: true,
                            }}
                            enablePaging={true}
                            horizontal={false}
                            enableAnnotationRendering={true}
                            enableDoubleTapZoom={true}
                            minScale={1.0}
                            maxScale={6.0}
                            scale={1.5}
                            spacing={10}
                            onLoadComplete={(numberOfPages) => {
                                console.log(`PDF loaded with ${numberOfPages} pages`);
                                setTotalPages(numberOfPages);
                            }}
                            onPageChanged={(page, numberOfPages) => {
                                console.log(`Current page: ${page}/${numberOfPages}`);
                                setCurrentPage(page);
                                setTotalPages(numberOfPages);
                            }}
                            onError={(error) => {
                                console.error('PDF error:', error);
                                Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: 'Failed to display PDF',
                                });
                            }}
                            onPressLink={(uri) => {
                                console.log(`Link pressed: ${uri}`);
                            }}
                            style={styles.pdf}
                        />
                    </View>
                ) : (
                    <View style={styles.errorContainer}>
                        <View style={styles.errorIconContainer}>
                            <LinearGradient
                                colors={['#FEE2E2', '#FCA5A5']}
                                style={styles.errorIconGradient}
                            >
                                <Feather name="alert-circle" size={48} color="#DC2626" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.errorTitle}>Receipt Unavailable</Text>
                        <Text style={styles.errorText}>No PDF receipt available to display</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchPdfReceipt}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#4A90C4', '#34B87C']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.retryButtonGradient}
                            >
                                <Feather name="refresh-cw" size={18} color="white" />
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingContent: {
        alignItems: 'center',
        padding: 32,
    },
    loadingIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#4A90C4',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    loadingSpinner: {
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    loadingSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    header: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerGradient: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        minWidth: 80,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    centerInfo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EBF5FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pageInfo: {
        fontSize: 13,
        color: '#4A90C4',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 80,
        justifyContent: 'flex-end',
    },
    iconButton: {
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconButtonGradient: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdfContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        backgroundColor: 'white',
    },
    pdfWrapper: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    pdf: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: 'white',
    },
    errorIconContainer: {
        marginBottom: 24,
    },
    errorIconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#4A90C4',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    retryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 32,
        gap: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});

export default TransactionReceipt;
