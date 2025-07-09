import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MarketplaceScreen = () => {
  const [tokenBalance, setTokenBalance] = useState(45);
  const [vipStatus, setVipStatus] = useState('free'); // free, monthly, lifetime
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'merch', name: 'BRN Merch', icon: 'shirt' },
    { id: 'events', name: 'Events', icon: 'calendar' },
    { id: 'nfts', name: 'NFTs', icon: 'diamond' },
    { id: 'partners', name: 'Partners', icon: 'business' },
    { id: 'vaults', name: 'Loyalty Vaults', icon: 'shield' },
  ];

  const vendors = [
    { id: 'all', name: 'All Vendors', icon: 'storefront' },
    { id: 'brn', name: 'BRN Official', icon: 'flame' },
    { id: 'liquid-death', name: 'Liquid Death', icon: 'water' },
    { id: 'first-scan', name: 'First Scan', icon: 'qr-code' },
    { id: 'brn-magazine', name: 'BRN Magazine', icon: 'book' },
  ];

  const [products] = useState([
    {
      id: '1',
      name: 'BRN Magazine Issue #5',
      vendor: 'brn-magazine',
      category: 'merch',
      basePrice: 30,
      normalDiscount: 0.17, // 17% off for normal users
      vipDiscount: 0.33, // 33% off for VIP users
      tokenPrice: 20,
      originalPrice: 30,
      image: '📖',
      description: 'Latest issue with exclusive content',
      inStock: true,
      featured: true,
      brandToken: null,
      loyaltyVault: null,
    },
    {
      id: '2',
      name: 'BRN Event Ticket - NYC',
      vendor: 'brn',
      category: 'events',
      basePrice: 60,
      normalDiscount: 0.17, // 17% off
      vipDiscount: 0.33, // 33% off
      tokenPrice: 40,
      originalPrice: 60,
      image: '🎫',
      description: 'Exclusive BRN community event',
      inStock: true,
      featured: false,
      brandToken: null,
      loyaltyVault: 'brn-vault',
    },
    {
      id: '3',
      name: 'Liquid Death Bundle',
      vendor: 'liquid-death',
      category: 'partners',
      basePrice: 35,
      normalDiscount: 0.14, // 14% off
      vipDiscount: 0.29, // 29% off
      tokenPrice: 25,
      originalPrice: 35,
      image: '🥤',
      description: 'Partner product with QR codes',
      inStock: true,
      featured: false,
      brandToken: 'LD',
      loyaltyVault: 'liquid-death-vault',
    },
    {
      id: '4',
      name: 'First Scan Hoodie',
      vendor: 'first-scan',
      category: 'merch',
      basePrice: 55,
      normalDiscount: 0.18, // 18% off
      vipDiscount: 0.36, // 36% off
      tokenPrice: 35,
      originalPrice: 55,
      image: '👕',
      description: 'Premium First Scan branded hoodie',
      inStock: true,
      featured: false,
      brandToken: 'FS',
      loyaltyVault: 'first-scan-vault',
    },
    {
      id: '5',
      name: 'BRN Loyalty Vault NFT',
      vendor: 'brn',
      category: 'vaults',
      basePrice: 120,
      normalDiscount: 0.25, // 25% off
      vipDiscount: 0.42, // 42% off
      tokenPrice: 80,
      originalPrice: 120,
      image: '💎',
      description: 'Rare NFT with future earning potential',
      inStock: true,
      featured: true,
      brandToken: null,
      loyaltyVault: 'brn-vault',
    },
  ]);

  const calculatePrice = (product: any, userType: 'normal' | 'vip') => {
    const discount = userType === 'vip' ? product.vipDiscount : product.normalDiscount;
    return Math.round(product.basePrice * (1 - discount));
  };

  const handlePurchase = (product: any, paymentType: 'fiat' | 'tokens') => {
    const userType = vipStatus === 'free' ? 'normal' : 'vip';
    const price = paymentType === 'fiat' ? calculatePrice(product, userType) : product.tokenPrice;
    const currency = paymentType === 'fiat' ? '$' : 'BRN';
    
    if (paymentType === 'tokens' && tokenBalance < product.tokenPrice) {
      Alert.alert('Insufficient Tokens', `You need ${product.tokenPrice} BRN to purchase this item`);
      return;
    }

    Alert.alert(
      'Purchase Confirmed!',
      `You bought ${product.name} for ${currency}${price}`,
      [
        { text: 'OK', onPress: () => {
          if (paymentType === 'tokens') {
            setTokenBalance(prev => prev - product.tokenPrice);
          }
        }}
      ]
    );
  };

  const handleVipUpgrade = (type: 'monthly' | 'lifetime') => {
    const monthlyCost = 15;
    const lifetimeCost = 150;
    const cost = type === 'monthly' ? monthlyCost : lifetimeCost;
    
    if (tokenBalance < cost) {
      Alert.alert('Insufficient Tokens', `You need ${cost} BRN for ${type} VIP`);
      return;
    }

    setTokenBalance(prev => prev - cost);
    setVipStatus(type);
    Alert.alert('🎉 VIP Activated!', 'You now have access to exclusive marketplace features and better discounts');
  };

  const renderProduct = ({ item }: { item: any }) => {
    const userType = vipStatus === 'free' ? 'normal' : 'vip';
    const fiatPrice = calculatePrice(item, userType);
    const discountPercentage = userType === 'vip' ? item.vipDiscount * 100 : item.normalDiscount * 100;
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>{item.image}</Text>
          </View>
          
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>
              {vendors.find(v => v.id === item.vendor)?.name}
            </Text>
            {item.brandToken && (
              <Text style={styles.brandToken}>${item.brandToken} Token</Text>
            )}
            {item.loyaltyVault && (
              <Text style={styles.loyaltyVault}>Loyalty Vault</Text>
            )}
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
          
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {userType === 'vip' ? 'VIP' : 'Normal'} Discount: {discountPercentage}% OFF
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceOption}>
              <Ionicons name="card-outline" size={16} color="#ff4444" />
              <Text style={styles.priceText}>${fiatPrice}</Text>
              <Text style={styles.originalPrice}>${item.originalPrice}</Text>
            </View>
            
            <View style={styles.priceOption}>
              <Ionicons name="wallet-outline" size={16} color="#ff4444" />
              <Text style={styles.priceText}>{item.tokenPrice} BRN</Text>
              <Text style={styles.tokenDiscount}>Save with tokens!</Text>
            </View>
          </View>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => handlePurchase(item, 'fiat')}
              disabled={!item.inStock}
            >
              <Text style={styles.buyButtonText}>Buy with $</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buyButton, styles.tokenButton]}
              onPress={() => handlePurchase(item, 'tokens')}
              disabled={!item.inStock || tokenBalance < item.tokenPrice}
            >
              <Text style={styles.buyButtonText}>Buy with BRN</Text>
            </TouchableOpacity>
          </View>
          
          {!item.inStock && (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          )}
        </View>
      </View>
    );
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.activeCategoryButton,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.id ? '#ffffff' : '#ff4444'} 
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.activeCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderVendor = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.vendorButton,
        selectedVendor === item.id && styles.activeVendorButton,
      ]}
      onPress={() => setSelectedVendor(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={16} 
        color={selectedVendor === item.id ? '#ffffff' : '#ff4444'} 
      />
      <Text
        style={[
          styles.vendorText,
          selectedVendor === item.id && styles.activeVendorText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const vendorMatch = selectedVendor === 'all' || product.vendor === selectedVendor;
    return categoryMatch && vendorMatch;
  });

  return (
    <View style={styles.container}>
      {/* VIP Status */}
      <View style={styles.vipSection}>
        <View style={styles.vipInfo}>
          <Text style={styles.vipTitle}>
            {vipStatus === 'free' ? 'Free User' : 
             vipStatus === 'monthly' ? 'Monthly VIP' : 'Lifetime VIP'}
          </Text>
          <Text style={styles.tokenBalance}>{tokenBalance} BRN</Text>
        </View>
        
        {vipStatus === 'free' && (
          <View style={styles.vipUpgrade}>
            <TouchableOpacity 
              style={styles.vipButton} 
              onPress={() => handleVipUpgrade('monthly')}
            >
              <Text style={styles.vipButtonText}>Monthly VIP (15 BRN)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.vipButton} 
              onPress={() => handleVipUpgrade('lifetime')}
            >
              <Text style={styles.vipButtonText}>Lifetime VIP (150 BRN)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Vendors */}
      <View style={styles.vendorsContainer}>
        <FlatList
          horizontal
          data={vendors}
          renderItem={renderVendor}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vendorsList}
        />
      </View>

      {/* Products */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  vipSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  vipInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  vipTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenBalance: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vipUpgrade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vipButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  vipButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333333',
  },
  activeCategoryButton: {
    backgroundColor: '#ff4444',
  },
  categoryText: {
    color: '#ff4444',
    fontSize: 14,
    marginLeft: 5,
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  vendorsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  vendorsList: {
    paddingHorizontal: 15,
  },
  vendorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 15,
    backgroundColor: '#333333',
  },
  activeVendorButton: {
    backgroundColor: '#ff4444',
  },
  vendorText: {
    color: '#ff4444',
    fontSize: 12,
    marginLeft: 3,
  },
  activeVendorText: {
    color: '#ffffff',
  },
  productsList: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productEmoji: {
    fontSize: 25,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  brandToken: {
    color: '#00ff00',
    fontSize: 10,
    marginTop: 2,
  },
  loyaltyVault: {
    color: '#ffaa00',
    fontSize: 10,
    marginTop: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 10,
  },
  discountBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priceOption: {
    alignItems: 'center',
    flex: 1,
  },
  priceText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  originalPrice: {
    color: '#888888',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  tokenDiscount: {
    color: '#00ff00',
    fontSize: 10,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  tokenButton: {
    backgroundColor: '#ff4444',
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  outOfStock: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default MarketplaceScreen; 