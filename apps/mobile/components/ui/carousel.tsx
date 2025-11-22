import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Dimensions, StyleSheet, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';

interface CarouselProps {
    children: React.ReactNode[];
    itemWidth?: number;
    itemSpacing?: number;
    showPagination?: boolean;
    paginationStyle?: 'dots' | 'bars';
    onPageChange?: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function Carousel({
    children,
    itemWidth = SCREEN_WIDTH - 48,
    itemSpacing = 16,
    showPagination = true,
    paginationStyle = 'dots',
    onPageChange,
}: CarouselProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const dotAnimationsRef = useRef<Animated.Value[]>([]);

    // Initialize animations for each child
    useEffect(() => {
        if (dotAnimationsRef.current.length !== children.length) {
            dotAnimationsRef.current = children.map(() => new Animated.Value(0));
            // Set initial state
            dotAnimationsRef.current[0]?.setValue(1);
        }
    }, [children.length]);

    useEffect(() => {
        dotAnimationsRef.current.forEach((anim, index) => {
            if (anim) {
                Animated.timing(anim, {
                    toValue: index === currentIndex ? 1 : 0,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }
        });
    }, [currentIndex]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / (itemWidth + itemSpacing));
        
        if (index !== currentIndex && index >= 0 && index < children.length) {
            setCurrentIndex(index);
            onPageChange?.(index);
        }
    };

    const scrollToIndex = (index: number) => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: index * (itemWidth + itemSpacing),
                animated: true,
            });
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled={false}
                snapToInterval={itemWidth + itemSpacing}
                snapToAlignment="start"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingHorizontal: 24 - itemSpacing / 2 },
                ]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {children.map((child, index) => (
                    <View
                        key={index}
                        style={[
                            styles.item,
                            {
                                width: itemWidth,
                                marginRight: itemSpacing,
                            },
                        ]}
                    >
                        {child}
                    </View>
                ))}
            </ScrollView>

            {showPagination && children.length > 1 && (
                <View style={styles.pagination}>
                    {children.map((_, index) => {
                        const anim = dotAnimationsRef.current[index];
                        if (!anim) return null;

                        const dotWidth = anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: paginationStyle === 'dots' ? [8, 24] : [20, 32],
                        });
                        const dotOpacity = anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.9],
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    paginationStyle === 'dots' ? styles.dot : styles.bar,
                                    {
                                        width: dotWidth,
                                        opacity: dotOpacity,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    bar: {
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
});

