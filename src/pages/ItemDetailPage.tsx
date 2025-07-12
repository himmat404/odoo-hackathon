import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, User, Calendar, Tag, Package, Shirt, MessageSquare } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { items, createSwapRequest, getUserProfile, addPointTransaction } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');

  const item = items.find(i => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <Link to="/browse" className="text-emerald-600 hover:text-emerald-700">
            ← Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const uploaderProfile = getUserProfile(item.uploaderId);

  const handleSwapRequest = () => {
    if (!user) return;

    createSwapRequest({
      requesterId: user.id,
      requesterName: user.name,
      requesterAvatar: user.avatar,
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.images[0],
      itemOwnerId: item.uploaderId,
      itemOwnerName: item.uploaderName,
      pointsOffered: item.pointValue,
      status: 'pending',
      message: swapMessage || 'I would like to swap for this item.'
    });

    setShowSwapModal(false);
    setSwapMessage('');
    alert('Swap request sent successfully!');
  };

  const handleRedeemWithPoints = () => {
    if (!user || user.points < item.pointValue) return;

    // Deduct points from user
    addPointTransaction({
      userId: user.id,
      type: 'spent',
      amount: -item.pointValue,
      description: `Redeemed ${item.title}`,
      relatedItemId: item.id,
      relatedItemTitle: item.title
    });

    // Award points to item owner
    addPointTransaction({
      userId: item.uploaderId,
      type: 'earned',
      amount: item.pointValue,
      description: `Points earned from ${item.title}`,
      relatedItemId: item.id,
      relatedItemTitle: item.title
    });

    setShowRedeemModal(false);
    alert('Item redeemed successfully! Contact the owner to arrange pickup/delivery.');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/browse" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to browse</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <img
                src={item.images[selectedImage]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-emerald-600' : ''
                    }`}
                  >
                    <img src={image} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.condition === 'New' ? 'bg-green-100 text-green-800' :
                      item.condition === 'Like New' ? 'bg-blue-100 text-blue-800' :
                      item.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.condition}
                    </span>
                    <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{item.pointValue} points</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">{item.description}</p>

              {/* Item Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shirt className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm font-medium">{item.size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Listed:</span>
                  <span className="text-sm font-medium">{item.uploadDate}</span>
                </div>
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploader Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  {uploaderProfile?.avatar ? (
                    <img src={uploaderProfile.avatar} alt={uploaderProfile.name} className="h-12 w-12 rounded-full" />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/profile/${item.uploaderId}`}
                        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {item.uploaderName}
                      </Link>
                      {uploaderProfile?.isVerified && (
                        <span className="text-emerald-600">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {uploaderProfile?.totalSwaps || 0} swaps • {uploaderProfile?.rating || 0}/5 rating
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {user && user.id !== item.uploaderId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowSwapModal(true)}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Request Swap
                  </button>
                  <button
                    onClick={() => setShowRedeemModal(true)}
                    className="border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                    disabled={user.points < item.pointValue}
                  >
                    Redeem with Points ({item.pointValue})
                  </button>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Please log in to request a swap</p>
                  <Link
                    to="/login"
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-block"
                  >
                    Log In
                  </Link>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 text-center">This is your own item</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Redeem with Points</h3>
            <p className="text-gray-600 mb-4">
              You're about to redeem "{item.title}" for {item.pointValue} points.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your current points:</span>
                <span className="font-semibold">{user?.points}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Points needed:</span>
                <span className="font-semibold">{item.pointValue}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining points:</span>
                <span className="font-semibold">{(user?.points || 0) - item.pointValue}</span>
              </div>
            </div>
      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request Swap</h3>
            <p className="text-gray-600 mb-4">
              Send a swap request for "{item.title}" to {item.uploaderName}.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={swapMessage}
                onChange={(e) => setSwapMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Add a personal message..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeemWithPoints}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Redeem Item
              </button>
            </div>
          </div>
        </div>
      )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSwapModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSwapRequest}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}